import type { SupportedLanguage, TestCase } from '../types/debugger.ts';

export interface SampleSnippet {
  id: string;
  title: string;
  language: SupportedLanguage;
  fileName: string;
  description: string;
  bugTypes: string[];
  code: string;
  suggestedTestCases: TestCase[];
}

export const SAMPLE_CODES: SampleSnippet[] = [
  {
    id: 'py-mutable-default',
    title: 'Python: Mutable Default Argument & Off-by-One',
    language: 'python',
    fileName: 'user_analytics.py',
    description:
      'Contains classic Python mutable default argument trap in a function definition, plus an off-by-one index error when calculating rolling averages.',
    bugTypes: ['Logical Error', 'Runtime Error', 'Edge Case'],
    code: `def track_user_actions(action, log_history=[]):
    """Appends action to history and returns total count."""
    log_history.append(action)
    return log_history

def compute_moving_averages(data_points, window_size):
    """Computes simple moving average across a series."""
    results = []
    # BUG: Range index causes IndexError on boundary or misses last element
    for i in range(0, len(data_points) - window_size + 2):
        window = data_points[i : i + window_size]
        avg = sum(window) / window_size
        results.append(round(avg, 2))
    return results

# Sample invocation
session_a = track_user_actions("login")
session_b = track_user_actions("search")
print("Session A:", session_a)
print("Session B:", session_b)  # Unexpectedly contains ['login', 'search']!

prices = [10, 20, 30, 40, 50]
print("Moving Averages:", compute_moving_averages(prices, 3))
`,
    suggestedTestCases: [
      {
        id: 'tc-1',
        input: 'prices = [10, 20, 30, 40, 50], window = 3',
        expectedOutput: '[20.0, 30.0, 40.0]',
      },
      {
        id: 'tc-2',
        input: 'track_user_actions("action1") then track_user_actions("action2")',
        expectedOutput: '["action2"] (isolated session)',
      },
    ],
  },
  {
    id: 'js-async-closure',
    title: 'JavaScript: Async Loop Closure & Unhandled Rejection',
    language: 'javascript',
    fileName: 'batch_processor.js',
    description:
      'Contains incorrect asynchronous map handling (Promise.all missing await), var variable leaking in loop closure, and lack of null check before property access.',
    bugTypes: ['Logical Error', 'Unhandled Promise Rejection', 'Null Reference'],
    code: `// Process user records concurrently
async function processUserBatches(users) {
  const processed = [];

  // BUG 1: forEach does not await async callback
  users.forEach(async (user) => {
    // BUG 2: Null pointer exception if user or metadata is undefined
    const emailDomain = user.profile.email.split('@')[1];
    
    const enriched = {
      id: user.id,
      domain: emailDomain.toLowerCase(),
      processedAt: new Date().toISOString()
    };
    processed.push(enriched);
  });

  // BUG 3: Returns before promises resolve because of async forEach
  return processed;
}

// Test runner
const sampleUsers = [
  { id: 1, profile: { email: "alice@company.com" } },
  { id: 2, profile: null }, // Trigger null pointer
  { id: 3, profile: { email: "bob@gmail.com" } }
];

processUserBatches(sampleUsers)
  .then(res => console.log("Done:", res))
  .catch(err => console.error("Batch Failed:", err));
`,
    suggestedTestCases: [
      {
        id: 'tc-js-1',
        input: '[{ id: 1, profile: { email: "a@x.com" } }, { id: 2, profile: null }]',
        expectedOutput: 'Processed items with safe fallback without throwing unhandled rejection',
      },
    ],
  },
  {
    id: 'ts-type-narrowing',
    title: 'TypeScript: Optional Chaining & Incomplete Type Guard',
    language: 'typescript',
    fileName: 'payment_gateway.ts',
    description:
      'Type narrowing failure when processing polymorphic transaction results, leading to possible runtime NaN and uncaught exceptions.',
    bugTypes: ['Type Narrowing', 'Runtime NaN', 'Incomplete Guard'],
    code: `interface SuccessResult {
  status: 'success';
  amount: number;
  currency: string;
  fee?: number;
}

interface FailureResult {
  status: 'failed';
  errorCode: string;
  reason: string;
}

type PaymentResponse = SuccessResult | FailureResult;

export function calculateNetDisbursement(response: PaymentResponse): number {
  // BUG: Accessing response.amount without validating that status is 'success'
  // Leads to runtime undefined -> NaN
  const gross = (response as any).amount;
  
  // BUG: fee could be undefined, resulting in NaN
  const net = gross - (response as any).fee;
  
  return parseFloat(net.toFixed(2));
}

// Trigger error
const failure: PaymentResponse = {
  status: 'failed',
  errorCode: 'INSUFFICIENT_FUNDS',
  reason: 'Card declined'
};

console.log("Calculated:", calculateNetDisbursement(failure));
`,
    suggestedTestCases: [
      {
        id: 'tc-ts-1',
        input: '{ status: "failed", errorCode: "ERR" }',
        expectedOutput: '0 or safe error handling instead of NaN',
      },
      {
        id: 'tc-ts-2',
        input: '{ status: "success", amount: 100 }',
        expectedOutput: '100.00 (fee defaults to 0)',
      },
    ],
  },
  {
    id: 'cpp-memory-leak',
    title: 'C++: Memory Leak & Buffer Overflow Boundary',
    language: 'cpp',
    fileName: 'buffer_manager.cpp',
    description:
      'Contains dynamic allocation without corresponding delete, off-by-one buffer iteration resulting in undefined behavior.',
    bugTypes: ['Memory Leak', 'Buffer Overflow', 'Undefined Behavior'],
    code: `#include <iostream>
#include <vector>

class DataBuffer {
private:
    int* buffer;
    size_t capacity;

public:
    DataBuffer(size_t size) : capacity(size) {
        // Dynamic raw pointer allocation
        buffer = new int[capacity];
    }

    // BUG: Missing destructor! Causes memory leak when object is destroyed.

    void fillAndPrint() {
        // BUG: Loop condition i <= capacity writes 1 element past array bounds!
        for (size_t i = 0; i <= capacity; ++i) {
            buffer[i] = static_cast<int>(i * 10);
        }

        std::cout << "Buffer contents: ";
        for (size_t i = 0; i < capacity; ++i) {
            std::cout << buffer[i] << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    DataBuffer db(5);
    db.fillAndPrint();
    return 0;
}
`,
    suggestedTestCases: [
      {
        id: 'tc-cpp-1',
        input: 'DataBuffer db(5)',
        expectedOutput: 'Buffer contents: 0 10 20 30 40 (no memory leak or out-of-bounds write)',
      },
    ],
  },
  {
    id: 'java-concurrent-mod',
    title: 'Java: ConcurrentModificationException & Unchecked Null',
    language: 'java',
    fileName: 'InventoryService.java',
    description:
      'Removing elements from an ArrayList during an enhanced for-loop, causing ConcurrentModificationException.',
    bugTypes: ['ConcurrentModificationException', 'Runtime Error'],
    code: `import java.util.ArrayList;
import java.util.List;

public class InventoryService {

    public static class Item {
        String sku;
        int stock;

        public Item(String sku, int stock) {
            this.sku = sku;
            this.stock = stock;
        }
    }

    public static void purgeOutOfStock(List<Item> inventory) {
        // BUG: Mutating list while iterating with enhanced for-loop!
        // Throws java.util.ConcurrentModificationException
        for (Item item : inventory) {
            if (item.stock <= 0) {
                inventory.remove(item);
            }
        }
    }

    public static void main(String[] args) {
        List<Item> items = new ArrayList<>();
        items.add(new Item("A101", 5));
        items.add(new Item("B202", 0));
        items.add(new Item("C303", 0));
        items.add(new Item("D404", 12));

        System.out.println("Purging items...");
        purgeOutOfStock(items);
        System.out.println("Remaining items: " + items.size());
    }
}
`,
    suggestedTestCases: [
      {
        id: 'tc-java-1',
        input: 'Inventory with stock [5, 0, 0, 12]',
        expectedOutput: 'Remaining items: 2 (without throwing ConcurrentModificationException)',
      },
    ],
  },
];
