import { Verifier, VerifierOptions } from "@pact-foundation/pact";
import { Server } from "http";
import { RegisterUserUseCase } from "../../modules/user/application/use-cases/register-user/register-user.use-case";
import { User } from "../../modules/user/domain/user.entity";
import { EmailService } from "../../modules/user/domain/email.service";
import { UserRepository } from "../../modules/user/domain/user.repository";
import setupUserRoutes from "../../modules/user/presentation/routes/user.routes";
import express from "express";
import { LoginUseCase } from "../../modules/user/application/use-cases/login/login.use-case";
import { Email } from "../../modules/user/domain/value-objects/email";
import { Password } from "../../modules/user/domain/value-objects/password";
import { UniqueEntityID } from "../../shared/domain/unique-entity-id";

describe("Pact Verification", () => {
  let server: Server;
  const port = 8081;

  const mockUserRepository: UserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    deleteAll: jest.fn(),
  };

  const mockEmailService: EmailService = {
    sendConfirmationEmail: jest.fn(),
  };

  const registerUserUseCase = new RegisterUserUseCase(mockUserRepository, mockEmailService);
  const loginUseCase = new LoginUseCase(mockUserRepository);

  // We create a slimmed down version of the app, only mounting the routes
  // we need for the contract tests.
  const app = express();
  app.use(express.json());
  const userRoutes = setupUserRoutes({ registerUserUseCase, loginUseCase });
  app.use("/users", userRoutes);

  beforeAll((done) => {
    server = app.listen(port, () => {
      console.log(`Provider service listening on http://localhost:${port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  const brokerUrl = process.env.PACT_BROKER_BASE_URL;

  // Only run Pact verification if the broker URL is set
  if (brokerUrl) {
    describe("for the user registration and login flows", () => {
      it("validates the expectations of its consumers", () => {
        const pactUrl = process.env.PACT_URL;

        const opts: VerifierOptions = {
          provider: "DigitalKudosWallBackend",
          providerBaseUrl: `http://localhost:${port}`,
          pactBrokerUrl: brokerUrl,
          pactBrokerToken: process.env.PACT_BROKER_TOKEN,
          publishVerificationResult: true,
          providerVersion: process.env.GITHUB_SHA || "1.0.0",
          logLevel: "info",
          stateHandlers: {
            "a user with email pact-test@example.com does not exist": async () => {
              (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
              (mockUserRepository.save as jest.Mock).mockImplementation((user: User) => Promise.resolve(user));
              return Promise.resolve("User does not exist state set up");
            },
            "a user with email existing@example.com already exists": async () => {
              (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue({
                id: "any-id",
                email: { value: "existing@example.com" },
              });
              return Promise.resolve("User already exists state set up");
            },
            "a user exists with email pact-test@example.com": async () => {
              const hashedPasswordResult = await Password.create("ValidPassword123!");
              const emailResult = Email.create("pact-test@example.com");

              if (hashedPasswordResult.isFailure || emailResult.isFailure) {
                throw new Error("Failed to create test user credentials");
              }

              const existingUser = User.create(
                {
                  name: "pact-test-user",
                  email: emailResult.getValue(),
                  password: hashedPasswordResult.getValue(),
                  isEmailVerified: false,
                },
                new UniqueEntityID("some-id")
              );

              if (existingUser.isFailure) {
                throw new Error("Failed to create test user");
              }

              (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser.getValue());
              return Promise.resolve("User exists state set up");
            },
          },
        };

        if (pactUrl) {
          opts.pactUrls = [pactUrl];
        } else {
          opts.consumerVersionSelectors = [{ tag: "main", latest: true }];
        }

        return new Verifier(opts).verifyProvider();
      });
    });
  } else {
    console.log("Skipping Pact verification. PACT_BROKER_BASE_URL not set.");
    // This empty test is here to prevent Jest from complaining about no tests in a file.
    test("skipping pact verification", () => {});
  }
});
