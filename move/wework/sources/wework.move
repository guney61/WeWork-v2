// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module wework::core {
    use std::string::String;
    use sui::object::{new, uid_to_inner, delete};
    use sui::transfer::{public_transfer, transfer, share_object};
    use sui::tx_context::{sender};
    use sui::coin::{Coin, into_balance, from_balance};
    use sui::sui::SUI;
    use sui::balance::Balance;
    use sui::event;
    use sui::package;
    use sui::display;
    use sui::dynamic_object_field as dof;

    // --- Errors ---
    const ENotEmployer: u64 = 0;
    const ENotWorker: u64 = 1;
    const EJobNotActive: u64 = 2;
    const EWrongCap: u64 = 3;
    const EWorkerMismatch: u64 = 4;
    const EContractNotStarted: u64 = 5;

    // --- REPUTATION (Nautilus Badge) ---
    public struct CORE has drop {} // OTW

    public struct NautilusCap has key, store { id: UID }

    public struct DeveloperBadge has key, store {
        id: UID,
        tier: String,
        score: u64,
        github_id: String
    }

    public fun tier(badge: &DeveloperBadge): String {
        badge.tier
    }

    public fun score(badge: &DeveloperBadge): u64 {
        badge.score
    }

    public fun github_id(badge: &DeveloperBadge): String {
        badge.github_id
    }

    // --- JOB BOARD ---
    public struct EmployerCap has key, store { id: UID, job_id: ID }

    public struct WorkerCap has key, store { id: UID, job_id: ID }

    public struct Job has key, store {
        id: UID,
        employer: address,
        title: String,
        budget: u64,
        is_active: bool,
    }

    public struct Contract has key, store {
        id: UID,
        job_id: ID,
        employer: address,
        worker: address,
        budget: u64,
        payment: Balance<SUI>,
        is_started: bool,
        is_complete: bool,
    }

    public struct Application has key, store {
        id: UID,
        worker: address,
        encrypted_cv_blob: String, // Walrus Blob ID
        message: String,
    }

    // --- Events ---
    public struct BadgeMinted has copy, drop { recipient: address, tier: String }

    // This function is called from a test
    #[allow(unused_mut_ref)]
    fun init(otw: CORE, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        
        // Display ayarları (Cüzdanda Rozet Görünümü)
        let keys = vector[std::string::utf8(b"name"), std::string::utf8(b"image_url")];
        let values = vector[std::string::utf8(b"{tier} WeWork Badge"), std::string::utf8(b"https://wework-assets.walrus.site/{tier}.png")];
        let mut display = display::new_with_fields<DeveloperBadge>(&publisher, keys, values, ctx);
        display::update_version(&mut display);

        public_transfer(publisher, sender(ctx));
        public_transfer(display, sender(ctx));
        
        // Nautilus yetkisini yaratıp sana (deploy edene) veriyoruz
        transfer(NautilusCap { id: new(ctx) }, sender(ctx));
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(CORE {}, ctx);
    }

    // --- Functions ---
    public fun mint_badge(
        _cap: &NautilusCap,
        recipient: address,
        tier: String,
        score: u64,
        github_hash: String,
        ctx: &mut TxContext
    ) {
        let badge = DeveloperBadge {
            id: new(ctx),
            tier: tier,
            score: score,
            github_id: github_hash
        };
        event::emit(BadgeMinted { recipient, tier });
        transfer(badge, recipient);
    }

    #[allow(lint(self_transfer))]
    public fun create_job(title: String, budget: u64, ctx: &mut TxContext) {
        let id = new(ctx);
        let job_id = uid_to_inner(&id);
        let job = Job { id, employer: sender(ctx), title, budget, is_active: true };
        let cap = EmployerCap { id: new(ctx), job_id };
        share_object(job);
        transfer(cap, sender(ctx));
    }

    public fun apply(job: &mut Job, encrypted_cv_blob: String, message: String, ctx: &mut TxContext) {
        let worker = sender(ctx);
        let app = Application { id: new(ctx), worker, encrypted_cv_blob, message };
        // Gizlilik için Dynamic Object Field kullanıyoruz
        dof::add(&mut job.id, worker, app);
    }

    public fun hire_worker(
        job: &mut Job,
        cap: &EmployerCap,
        worker: address,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(job.employer == sender(ctx), ENotEmployer);
        assert!(job.is_active, EJobNotActive);
        assert!(uid_to_inner(&job.id) == cap.job_id, EWrongCap);

        // Remove the application
        let app: Application = dof::remove(&mut job.id, worker);
        let Application { id, worker: app_worker, encrypted_cv_blob: _, message: _ } = app;
        assert!(app_worker == worker, EWorkerMismatch); 
        delete(id); // Delete the application object

        // Create the contract
        let contract = Contract {
            id: new(ctx),
            job_id: cap.job_id,
            employer: job.employer,
            worker: worker,
            budget: job.budget,
            payment: into_balance(payment),
            is_started: false,
            is_complete: false,
        };

        // Update the job status
        job.is_active = false;
        
        let worker_cap = WorkerCap { id: new(ctx), job_id: cap.job_id };

        // Transfer the contract to the worker
        transfer(contract, worker);
        transfer(worker_cap, worker);
    }

    public fun accept_job(contract: &mut Contract, cap: &WorkerCap, ctx: &mut TxContext) {
        assert!(contract.worker == sender(ctx), ENotWorker);
        assert!(contract.job_id == cap.job_id, EWrongCap);

        contract.is_started = true;
    }

    public fun complete_job(
        contract: Contract,
        employer_cap: EmployerCap,
        worker_cap: WorkerCap,
        ctx: &mut TxContext
    ) {
        assert!(contract.employer == sender(ctx), ENotEmployer);
        assert!(contract.is_started, EContractNotStarted);

        let EmployerCap { id: cap_id, job_id: _ } = employer_cap;
        delete(cap_id);
        let WorkerCap { id: cap_id, job_id: _ } = worker_cap;
        delete(cap_id);

        let Contract { id, job_id: _, employer: _, worker, budget: _, payment, is_started: _, is_complete: _ } = contract;

        // Transfer the final payment to the worker
        public_transfer(from_balance(payment, ctx), worker);

        // Clean up the contract object
        delete(id);
    }

}