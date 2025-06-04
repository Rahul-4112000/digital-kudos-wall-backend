# Standard Operating Procedure: Test Doubles

**Status:** Mandatory
**Version:** 1.0
**Date:** {{CURRENT_DATE}}

**NON-NEGOTIABLE STANDARD:** Adherence to this SOP is mandatory for the correct selection and implementation of Test Doubles in our testing suites. Deviations are not permitted without explicit architectural review and approval.

## 1. Purpose

This SOP defines the standards for using Test Doubles within the Digital Kudos Wall backend application. The goal is to ensure that Test Doubles are used appropriately and consistently, supporting effective Sociable Unit Tests by isolating the System Under Test (SUT) from certain collaborators, primarily those at architectural boundaries.

## 2. Scope

This SOP applies to all tests where a production object is replaced by a test-specific object for testing purposes, particularly within Sociable Unit Tests. It governs the choice and implementation of Dummies, Stubs, and Spies. The use of Fakes and Mocks (in the strict sense) requires specific justification.

## 3. Definitions (Based on Martin Fowler)

- **Test Double (Generic Term):** Any object that replaces a production object for testing purposes.
- **Dummy:** Objects passed around but never actually used. Usually fill parameter lists. Their methods are not expected to be called.
- **Stub:** Objects that provide "canned answers" (predefined responses) to calls made during the test. They are used when the test needs a collaborator to return specific data to proceed. Stubs are primarily used for _state verification_ (i.e., you check the state of the SUT after interacting with a stub).
- **Spy:** Objects that are Stubs but also record information about how they were called (e.g., number of calls, arguments passed). Spies can be used for _behavior verification_ (i.e., you check that the SUT called the spy correctly).
- **Mock (Strict Definition):** Objects that are pre-programmed with _expectations_ of the calls they are supposed to receive. They verify these expectations _after_ the SUT is exercised. Mocks are primarily used for _behavior verification_ and often drive a different style of TDD (Mockist TDD).
- **Fake:** Objects that have working implementations, but take some shortcut making them unsuitable for production (e.g., an in-memory database). _Fakes are generally NOT used within Sociable Unit Tests for boundary dependencies (we use Stubs/Spies). Fakes might be considered for Narrow Integration Tests under specific circumstances (see `SOP-NarrowIntegrationTests.md`)_.

## 4. Guiding Principles for Usage (Non-Negotiable)

### 4.1. Primary Test Doubles for Sociable Unit Tests: Stubs and Spies

- **Standard:** For Sociable Unit Tests of use cases, `jest.fn()` MUST be used to create Test Doubles for boundary dependencies (e.g., `UserRepository`, `EmailService`). These `jest.fn()` instances will function as **Stubs** and/or **Spies**.
- **Rationale:** `jest.fn()` provides a concise and powerful way to define canned responses (Stub behavior) and automatically records call information (Spy behavior), fitting our preferred Classical TDD approach with behavior verification for interactions.

### 4.2. Using `jest.fn()` as a Stub

- **Standard:** When the SUT needs a collaborator to return a specific value or resolve a promise for the test to proceed, configure the `jest.fn()` mock implementation accordingly.
- **Focus:** The primary goal is to control the data/state flow into the SUT from the collaborator.
- \*\*Example (`userRepository.findByEmail` as a Stub):

  ```typescript
  // In a test for RegisterUserUseCase
  const mockExistingUser = User.create(...).getValue();
  userRepository.findByEmail = jest.fn().mockResolvedValue(mockExistingUser); // Stubbing the return value

  // SUT acts based on this stubbed value
  const result = await useCase.execute({ email: "exists@example.com", password: "..." });

  expect(result.isFailure).toBe(true); // State verification of SUT
  expect(result.error()).toBeInstanceOf(UserAlreadyExistsError);
  ```

### 4.3. Using `jest.fn()` as a Spy

- **Standard:** When a test needs to verify that the SUT correctly invoked a method on a collaborator (and with what arguments), use Jest's built-in spy matchers (`toHaveBeenCalled`, `toHaveBeenCalledWith`, etc.) on the `jest.fn()` instance.
- **Focus:** The primary goal is to verify the interaction (behavior) between the SUT and its collaborator.
- \*\*Example (`userRepository.save` and `emailService.sendConfirmationEmail` as Spies):

  ```typescript
  // In a test for RegisterUserUseCase, after successful action
  userRepository.save = jest.fn().mockImplementation((user: User) => Promise.resolve(user)); // Stubbing part
  emailService.sendConfirmationEmail = jest.fn().mockResolvedValue(undefined); // Stubbing part

  await useCase.execute({ email: "new@example.com", password: "ValidPass123!" });

  expect(userRepository.save).toHaveBeenCalled(); // Spy verification
  expect(userRepository.save).toHaveBeenCalledWith(expect.any(User)); // Spy verification with argument matching

  expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith("new@example.com"); // Spy verification
  ```

### 4.4. Preference for Classical TDD (State and Interaction Verification)

- **Standard:** Our primary approach for Sociable Unit Tests is Classical TDD. We verify the state of the SUT (via its return values or observable properties) and verify significant _interactions_ with collaborators using Spies.
- **Avoid Strict Mocking (Pre-defined Expectations):** We generally AVOID the Mockist TDD approach of defining strict expectations on mocks _before_ the SUT action and then verifying the mock itself. Our Jest Spies are asserted _after_ the SUT action.
- **Rationale:** This tends to lead to tests that are less coupled to the exact sequence of internal calls and more focused on the essential outcomes and collaborations, making them more robust to refactoring.

### 4.5. Dummies

- **Standard:** If a method requires a parameter that is not used in the specific test path being exercised, a simple Dummy object (e.g., `{}`, `jest.fn()` that is not configured or asserted against) MAY be used. However, if the dependency is an interface for which we typically create Stubs/Spies (like `UserRepository`), it is preferable to provide a standard `jest.fn()` even if not all its methods are relevant for every single test case within the suite.

### 4.6. Fakes

- **Standard:** Fakes (e.g., an `InMemoryUserRepository` with actual logic) are generally NOT to be used as replacements for boundary dependencies _within Sociable Unit Tests of use cases_. The `SOP-SociableUnitTests.md` mandates Stubs/Spies for these boundaries.
- **Rationale:** Fakes can introduce their own complexity and bugs, and may not perfectly replicate the behavior of the real production component, especially edge cases or performance characteristics. Their primary place, if any, is for specific types of integration or component testing, with careful consideration.

## 5. Implementation with `jest.fn()`

- **Stubbing Return Values:** `.mockReturnValue(value)`, `.mockResolvedValue(value)`, `.mockRejectedValue(error)`.
- **Stubbing Implementations:** `.mockImplementation(() => { /* custom logic */ })`.
- **Spying on Calls:**
  - `expect(mySpy).toHaveBeenCalled()`
  - `expect(mySpy).toHaveBeenCalledTimes(number)`
  - `expect(mySpy).toHaveBeenCalledWith(arg1, arg2, ...)`
  - `expect(mySpy).toHaveBeenLastCalledWith(arg1, arg2, ...)`
  - Accessing call arguments: `mySpy.mock.calls`.

## 6. Related SOPs

- `SOP-SociableUnitTests.md`
- `SOP-NarrowIntegrationTests.md`

## 7. Enforcement

Correct application of Test Double patterns as defined here is critical for test maintainability and effectiveness. Violations will be addressed during code reviews. These standards are non-negotiable.
