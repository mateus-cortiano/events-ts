/* main.test.ts */

import { EventSystem } from '../lib/index'

// ---

interface TestEvents {
  test1: (data: [number]) => void
  test2: (data: [number], data2: [number]) => void
}

describe('events system test', () => {
  test('should emit to multiple listeners', () => {
    let mock_data1: [number] = [0]
    let mock_data2: [number] = [0]
    let events = new EventSystem<TestEvents>()
    let events2 = new EventSystem<TestEvents>()

    /* 01 */ let rm_listener1 = events.on('test1', data => (data[0] += 1))
    /* 02 */ let rm_listener2 = events.on('test1', data => (data[0] += 2))
    /* 03 */ let rm_listener3 = events.on('test1', data => (data[0] += 3))
    /* 04 */ let rm_listener4 = events.on('test2', data => (data[0] += 4))
    /* 05 */ let rm_listener5 = events.on('test2', (data, data2) => {
      data[0] += 5
      data2[0] += 5
    })

    /* 06 */ events.once('test1', data => (data[0] += 1))
    /* 07 */ events.once('test2', (data, data2) => {
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
    /* 08 */ events.once('test1', data => (data[0] += 4)) // adds a once listener

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

  test('should emit just once to once listeners', () => {
    let mock_data1: [number] = [0]
    let mock_data2: [number] = [0]
    let events = new EventSystem<TestEvents>()

    /* 00 */ let rm_listener0 = events.once('test1', data => (data[0] += 4))
    /* 01 */ events.once('test1', data => (data[0] += 1))
    /* 02 */ events.once('test1', data => (data[0] += 2))
    /* 03 */ events.once('test2', data => (data[0] += 3))
    /* 04 */ events.once('test2', (data, data2) => {
      data[0] += 5
      data2[0] += 5
    })

    // ---

    rm_listener0() // removes [00] from 'test1' before emitting
    events.emit('test1', mock_data1) // should reach [01, 02] and drop [01, 02]

    expect(mock_data1[0]).toBe(3)
    expect(mock_data2[0]).toBe(0)

    // ---

    /* 05 */ events.once('test1', data => (data[0] += 4)) // adds a once listener to 'test1'
    events.emit('test1', mock_data1) // should reach [05] and drop [05]
    events.emit('test2', mock_data1, mock_data2) // should reach [03, 04] and drop [03, 04]

    expect(mock_data1[0]).toBe(15)
    expect(mock_data2[0]).toBe(5)

    // ---

    events.emit('test1', mock_data1) // should reach no listeners
    events.emit('test2', mock_data1, mock_data2) // should reach no listeners

    expect(mock_data1[0]).toBe(15)
    expect(mock_data2[0]).toBe(5)
  })
})
