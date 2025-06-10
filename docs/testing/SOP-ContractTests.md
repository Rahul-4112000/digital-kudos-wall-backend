# SOP: Contract Testing (Provider)

This document outlines the **non-negotiable** principles and practices for contract testing in the Digital Kudos Wall project. As the provider, it is our responsibility to honor the contracts set forth by our consumers.

### Guiding Principles

- **Independent Deployability**: Our primary goal is to enable the frontend (consumer) and backend (provider) to deploy independently, with 100% confidence that they can interoperate correctly.
- **Fast, Automated Feedback**: Contract tests are a critical part of our commit stage. The process **must** be fully automated to provide immediate feedback if a change breaks an agreed-upon contract.
- **Consumer-Driven, Provider-Verified**: The consumer's expectations drive the contract. We do not write contracts; we verify them. The consumer is always right.

### The Automated Contract Testing Workflow

The manual sharing of contract files is **prohibited**. All contract-related activities are automated through the CI/CD pipelines and the Pact Broker, which is the single source of truth for all contracts.

#### Path A: The Consumer Changes a Contract

1.  **Contract Publication**: The consumer's CI pipeline automatically publishes a new version of a contract to the Pact Broker whenever a change is pushed.
2.  **Webhook Trigger**: The Pact Broker immediately fires a webhook to our GitHub Actions workflow.
3.  **Automated Verification**: Our `commit-stage` CI pipeline is triggered by this webhook. It fetches the specific contract that changed and runs the verification tests against it.
4.  **Results Publication**: The verification results (SUCCESS or FAILURE) are automatically published back to the broker. A failure here will block the provider's pipeline, providing immediate feedback.

#### Path B: The Provider Changes Its Own Code

1.  **Commit Trigger**: When a developer pushes a change to the provider codebase, the `commit-stage` CI pipeline runs.
2.  **Fetch Latest Contract**: The "Run Provider Contract Verification" step automatically fetches the latest version of all consumer contracts tagged with `main` from the Pact Broker.
3.  **Verification**: The provider code is tested against these contracts. If our change has broken any consumer's expectations, the pipeline will fail.

### Non-Negotiable Rules for Provider Verification

1.  **The Pact Broker is Mandatory**: All contract verification **must** fetch contracts from the central Pact Broker. No other mechanism is permitted.
2.  **State Handlers Are the Core**: The `stateHandlers` in `provider.contract.test.ts` are the most critical part of the test. They **must** accurately prepare the system for the specific scenario defined in the consumer's contract. This is done by mocking the repository layer (`mockUserRepository`) to simulate the required database state.
3.  **Black-Box Verification**: The verification test **must** treat the running service as a black box. It starts the server and sets state. It **must not** have any knowledge of the provider's internal business logic (e.g., use cases, controllers).
4.  **Isolate External Services**: The provider verification **must not** communicate with real, external third-party services. All such dependencies (e.g., `EmailService`) **must** be stubbed or mocked.
5.  **CI is a Hard Gate**: Contract verification **must** be a required step in the `commit-stage.yml`. A failure indicates a breaking change for a consumer and **must** stop the pipeline.
6.  **`can-i-deploy` is the Gatekeeper**: The `release-uat.yml` workflow **must** use `pact-broker can-i-deploy` to check if a new version of the provider is safe to deploy. This command confirms that the provider has successfully verified the contracts for all consumer versions currently in that environment. A deployment **must not** proceed if this check fails.
