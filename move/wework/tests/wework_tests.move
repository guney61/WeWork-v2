#[test_only]
module wework::wework_tests {
    use sui::test_scenario::{begin, next_tx, take_from_sender, take_shared, return_shared, return_to_sender, take_from_address, ctx};
    use sui::coin::mint_for_testing;
    use sui::sui::SUI;
    use wework::core::{Job, EmployerCap, WorkerCap, Contract, NautilusCap, DeveloperBadge, create_job, apply, hire_worker, accept_job, complete_job, mint_badge, test_init, tier, score, github_id};
    

    const EMPLOYER: address = @0x1;
    const WORKER: address = @0x2;
    const ADMIN: address = @0x3;

    #[test]
    fun test_job_lifecycle() {
        let mut scenario = begin(ADMIN);

        
        // Employer creates a job
        next_tx(&mut scenario, EMPLOYER);
        {
            create_job(
                std::string::utf8(b"Test Job"),
                1000,
                ctx(&mut scenario)
            );
        };

        // Worker applies for the job
        next_tx(&mut scenario, WORKER);
        {
            let mut job = take_shared<Job>(&scenario);
            apply(
                &mut job,
                std::string::utf8(b"cv"),
                std::string::utf8(b"message"),
                ctx(&mut scenario)
            );
            return_shared(job);
        };

        // Employer hires the worker
        next_tx(&mut scenario, EMPLOYER);
        {
            let mut job = take_shared<Job>(&scenario);
            let cap = take_from_sender<EmployerCap>(&scenario);
            let payment = mint_for_testing<SUI>(1000, ctx(&mut scenario));

            hire_worker(
                &mut job,
                &cap,
                WORKER,
                payment,
                ctx(&mut scenario)
            );

            return_shared(job);
            return_to_sender(&scenario, cap);
        };

        // Worker accepts the job
        next_tx(&mut scenario, WORKER);
        {
            let mut contract = take_from_sender<Contract>(&scenario);
            let cap = take_from_sender<WorkerCap>(&scenario);

            accept_job(
                &mut contract,
                &cap,
                ctx(&mut scenario)
            );

            return_to_sender(&scenario, contract);
            return_to_sender(&scenario, cap);
        };

        // Employer completes the job
        next_tx(&mut scenario, EMPLOYER);
        {
            let contract = take_from_address<Contract>(&scenario, WORKER);
            let employer_cap = take_from_sender<EmployerCap>(&scenario);
            let worker_cap = take_from_address<WorkerCap>(&scenario, WORKER);

            complete_job(
                contract,
                employer_cap,
                worker_cap,
                ctx(&mut scenario)
            );
        };

        sui::test_scenario::end(scenario);
    }

    #[test]
    fun test_mint_badge() {
        let mut scenario = begin(ADMIN);

        // Initial transaction to create the NautilusCap
        next_tx(&mut scenario, ADMIN);
        {
            test_init(ctx(&mut scenario));
        };

        // ADMIN gives NautilusCap to the EMPLOYER
        next_tx(&mut scenario, ADMIN);
        {
            let cap = take_from_sender<NautilusCap>(&scenario);
            transfer::public_transfer(cap, EMPLOYER);
        };

        // Employer mints a badge for the worker
        next_tx(&mut scenario, EMPLOYER);
        {
            let cap = take_from_sender<NautilusCap>(&scenario);
            mint_badge(
                &cap,
                WORKER,
                std::string::utf8(b"Gold"),
                100,
                std::string::utf8(b"github_hash"),
                ctx(&mut scenario)
            );
            return_to_sender(&scenario, cap);
        };

        // Verify that the badge was minted
        next_tx(&mut scenario, WORKER);
        {
            let badge = take_from_sender<DeveloperBadge>(&scenario);
            assert!(tier(&badge) == std::string::utf8(b"Gold"), 0);
            assert!(score(&badge) == 100, 1);
            assert!(github_id(&badge) == std::string::utf8(b"github_hash"), 2);
            return_to_sender(&scenario, badge);
        };

        sui::test_scenario::end(scenario);
    }
}
