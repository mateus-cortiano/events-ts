/* aevents.test.ts */

import { AsyncEventSystem } from '../lib/index'

// ---

const MIN_DELAY = 500
const VAR_DELAY = 2000

jest.setTimeout(60 * 1000) // 60 seconds

// ---

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms).unref())
}

function create_fuzzed_async_fn(fn: (...args: any) => any) {
  return async function (...args: Parameters<typeof fn>) {
    await sleep(MIN_DELAY + Math.random() * VAR_DELAY)
    fn(...args)
  }
}

interface TestEvents {
  test1: (data: [number]) => Promise<any>
  test2: (data: [number], data2: [number]) => Promise<any>
}

describe('async events system test', () => {
  test('should emit synchronously to async listeners', () => {
    let mock_data1: [number] = [0]
    let mock_data2: [number] = [0]
    let events = new AsyncEventSystem<TestEvents>()
    let events2 = new AsyncEventSystem<TestEvents>()

    /* 01 */ let rm_listener1 = events.on('test1', async data => (data[0] += 1))
    /* 02 */ let rm_listener2 = events.on('test1', async data => (data[0] += 2))
    /* 03 */ let rm_listener3 = events.on('test1', async data => (data[0] += 3))
    /* 04 */ let rm_listener4 = events.on('test2', async data => (data[0] += 4))
    /* 05 */ let rm_listener5 = events.on('test2', async (data, data2) => {
      data[0] += 5
      data2[0] += 5
    })

    /* 06 */ events.once('test1', async data => (data[0] += 1))
    /* 07 */ events.once('test2', async (data, data2) => {
      data[0] += 5
      data2[0] += 5
    })

    // ---

    events.emit('test1', mock_data1) // should reach [01, 02, 03, 06] and drop [06]

    expect(mock_data1[0]).toBe(7)
    expect(mock_data2[0]).toBe(0)

    // ---

    rm_listener1() // removes [01] from 'test1'

    events.emit('test1', mock_data1) // should reach [02, 03]
    events.emit('test2', mock_data1, mock_data2) // should reach [04, 05, 07] and drop [07]

    expect(mock_data1[0]).toBe(26)
    expect(mock_data2[0]).toBe(10)

    // ---

    rm_listener2() // removes [02] from 'test1'
    /* 08 */ events.once('test1', async data => (data[0] += 4)) // adds a once listener

    events2.emit('test1', mock_data1) // should reach no listener
    events.emit('test1', mock_data1) // should reach [03, 08] and drop [08]
    events.emit('test2', mock_data1, mock_data2) // should reach [04, 05]

    expect(mock_data1[0]).toBe(42)
    expect(mock_data2[0]).toBe(15)

    // ---

    rm_listener3() // removes [03] from 'test1'
    rm_listener4() // removes [04] from 'test2'

    events.emit('test1', mock_data1) // should reach no listener
    events.emit('test2', mock_data1, mock_data2) // should reach [05]

    expect(mock_data1[0]).toBe(47)
    expect(mock_data2[0]).toBe(20)

    // ---

    rm_listener5() // removes [05] from 'test2'

    events.emit('test1', mock_data1) // should reach no listener
    events.emit('test2', mock_data1, mock_data2) // should reach no listener

    expect(mock_data1[0]).toBe(47)
    expect(mock_data2[0]).toBe(20)
  })

  test('should emit asynchronously to on and once async listeners with various amounts of delays', async () => {
    let mock_data1: [number] = [0]
    let mock_data2: [number] = [0]
    let events = new AsyncEventSystem<TestEvents>()

    /* 01 */ let rm_listener1 = events.on(
      'test1',
      create_fuzzed_async_fn((data: [number]) => {
        data[0] += 1
      })
    )

    /* 02 */ let rm_listener2 = events.on(
      'test1',
      create_fuzzed_async_fn((data: [number]) => {
        data[0] += 2
      })
    )

    /* 03 */ let rm_listener3 = events.on(
      'test1',
      create_fuzzed_async_fn((data: [number]) => {
        data[0] += 3
      })
    )

    /* 04 */ let rm_listener4 = events.on(
      'test2',
      create_fuzzed_async_fn((data: [number]) => {
        data[0] += 4
      })
    )

    /* 05 */ let rm_listener5 = events.on(
      'test2',
      create_fuzzed_async_fn((data: [number], data2: [number]) => {
        data[0] += 5
        data2[0] += 5
      })
    )

    /* 06 */ events.once(
      'test1',
      create_fuzzed_async_fn((data: [number]) => {
        data[0] += 1
      })
    )
    /* 07 */ events.once(
      'test2',
      create_fuzzed_async_fn((data: [number], data2: [number]) => {
        data[0] += 5
        data2[0] += 5
      })
    )

    // ---

    await events.aemit('test1', mock_data1) // should reach [01, 02, 03, 06] and drop [06]

    expect(mock_data1[0]).toBe(7)
    expect(mock_data2[0]).toBe(0)

    // ---

    rm_listener1() // removes [01] from 'test1'

    await events.aemit('test1', mock_data1) // should reach [02, 03]
    await events.aemit('test2', mock_data1, mock_data2) // should reach [04, 05, 07] and drop [07]

    expect(mock_data1[0]).toBe(26)
    expect(mock_data2[0]).toBe(10)
    // ---

    rm_listener2() // removes [02] from 'test1'

    // adds a once listener
    /* 08 */ events.once(
      'test1',
      create_fuzzed_async_fn(data => (data[0] += 4))
    )

    await events.aemit('test1', mock_data1) // should reach [03, 08] and drop [08]
    await events.aemit('test2', mock_data1, mock_data2) // should reach [04, 05]

    expect(mock_data1[0]).toBe(42)
    expect(mock_data2[0]).toBe(15)

    // ---

    rm_listener3() // removes [03] from 'test1'
    rm_listener4() // removes [04] from 'test2'

    await events.aemit('test1', mock_data1) // should reach no listener
    await events.aemit('test2', mock_data1, mock_data2) // should reach [05]

    expect(mock_data1[0]).toBe(47)
    expect(mock_data2[0]).toBe(20)

    // ---

    rm_listener5() // removes [05] from 'test2'

    await events.aemit('test1', mock_data1) // should reach no listener
    await events.aemit('test2', mock_data1, mock_data2) // should reach no listener
    expect(mock_data1[0]).toBe(47)
    expect(mock_data2[0]).toBe(20)
  })
})
