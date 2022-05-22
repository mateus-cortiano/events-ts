/* main.test.ts */

import { EventSystem } from '../lib/eventsystem'

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

    events.once('test1', data => (data[0] += 1))
    let rm_listener1 = events.on('test1', data => (data[0] += 1))
    let rm_listener2 = events.on('test1', data => (data[0] += 2))
    let rm_listener3 = events.on('test1', data => (data[0] += 3))
    let rm_listener4 = events.on('test2', data => (data[0] += 4))
    let rm_listener5 = events.on('test2', (data, data2) => {
      data[0] += 5
      data2[0] += 5
    })
    events.once('test2', (data, data2) => {
      data[0] += 5
      data2[0] += 5
    })

    // ---

    events.emit('test1', mock_data1) // should reach three listeners

    expect(mock_data1[0]).toBe(7)
    expect(mock_data2[0]).toBe(0)

    // ---

    rm_listener1() // removes one of the 'test' listeners
    events.emit('test1', mock_data1) // should reach two listeners
    events.emit('test2', mock_data1, mock_data2) // should reach one listener

    expect(mock_data1[0]).toBe(26)
    expect(mock_data2[0]).toBe(10)

    // ---

    rm_listener2() // removes another 'test' listeners
    events.once('test1', data => (data[0] += 4)) // adds a once listener
    events.emit('test1', mock_data1) // should reach one listener
    events.emit('test2', mock_data1, mock_data2) // should reach one listener

    expect(mock_data1[0]).toBe(42)
    expect(mock_data2[0]).toBe(15)

    // ---

    rm_listener3() // removes last 'test' listeners
    rm_listener4() // removes one of two 'test2' listener
    events.emit('test1', mock_data1) // should reach no listener
    events.emit('test2', mock_data1, mock_data2) // should reach no listener

    expect(mock_data1[0]).toBe(47)
    expect(mock_data2[0]).toBe(20)

    // ---

    rm_listener5() // removes last 'test2' listener

    events.emit('test1', mock_data1) // should reach no listener
    events.emit('test2', mock_data1, mock_data2) // should reach no listener

    expect(mock_data1[0]).toBe(47)
    expect(mock_data2[0]).toBe(20)
  })

  test('should emit just once to once listeners', () => {
    let mock_data1: [number] = [0]
    let mock_data2: [number] = [0]
    let events = new EventSystem<TestEvents>()

    let rm_listener = events.once('test1', data => (data[0] += 4))
    events.once('test1', data => (data[0] += 1))
    events.once('test1', data => (data[0] += 2))
    events.once('test2', data => (data[0] += 3))
    events.once('test2', (data, data2) => {
      data[0] += 5
      data2[0] += 5
    })

    // ---

    rm_listener() // remove one of the listeners before emit
    events.emit('test1', mock_data1) // should reach just two listeners

    expect(mock_data1[0]).toBe(3)
    expect(mock_data2[0]).toBe(0)

    // ---

    events.once('test1', data => (data[0] += 4))
    events.emit('test1', mock_data1) // should one listener
    events.emit('test2', mock_data1, mock_data2) // should reach two listeners

    expect(mock_data1[0]).toBe(15)
    expect(mock_data2[0]).toBe(5)

    // ---

    events.emit('test1', mock_data1) // should reach no listeners
    events.emit('test2', mock_data1, mock_data2) // should reach no listeners

    expect(mock_data1[0]).toBe(15)
    expect(mock_data2[0]).toBe(5)
  })
})
