import Foundation
import Combine

// Combine Extensions - Combine helpers
extension Publisher {
    /// Retry with exponential backoff
    func retryWithBackoff(maxRetries: Int = 3, initialDelay: TimeInterval = 1.0) -> AnyPublisher<Output, Failure> {
        return self.catch { error -> AnyPublisher<Output, Failure> in
            guard maxRetries > 0 else {
                return Fail(error: error).eraseToAnyPublisher()
            }
            
            return Just(())
                .delay(for: .seconds(initialDelay), scheduler: DispatchQueue.main)
                .flatMap { _ in
                    self.retryWithBackoff(maxRetries: maxRetries - 1, initialDelay: initialDelay * 2)
                }
                .eraseToAnyPublisher()
        }
        .eraseToAnyPublisher()
    }
    
    /// Timeout with custom error
    func timeout<S: Scheduler>(
        _ interval: S.SchedulerTimeType.Stride,
        scheduler: S,
        customError: @escaping () -> Failure
    ) -> AnyPublisher<Output, Failure> {
        return self.timeout(interval, scheduler: scheduler, options: nil, customError: customError)
    }
}

// Convenience extensions for common operations
extension AnyPublisher {
    /// Execute on main thread
    func receiveOnMain() -> AnyPublisher<Output, Failure> {
        return self.receive(on: DispatchQueue.main).eraseToAnyPublisher()
    }
    
    /// Execute on background thread
    func receiveOnBackground() -> AnyPublisher<Output, Failure> {
        return self.receive(on: DispatchQueue.global(qos: .userInitiated)).eraseToAnyPublisher()
    }
}


