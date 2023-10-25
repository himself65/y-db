import { createIndexedDBProvider as createYDBIDBProvider } from 'y-idb/browser'
import { IndexeddbPersistence } from 'y-indexeddb'
import { createIndexedDBProvider } from '@toeverything/y-indexeddb'
import { Doc } from 'yjs'
import { openDB } from 'idb'

await openDB('setup', 1)

console.log('--- empty ---')

let isFirst = true

for (let i = 0; i < 2; i++) {
  {
    performance.mark('sync')
    const doc = new Doc({
      guid: 'indexeddb-test-01-empty'
    })
    const idbPersistence = new IndexeddbPersistence('indexeddb-test-01-empty',
      doc)
    await idbPersistence.whenSynced.then(async () => {
      performance.mark('sync-end')
      const perf = performance.measure('sync', 'sync', 'sync-end')
      if (!isFirst) {
        console.log('indexeddb loading speed', perf.duration)
      }
      await idbPersistence.destroy()
    })
  }

  {
    performance.mark('sync')
    const doc = new Doc({
      guid: 'ydb-test-01-empty'
    })
    const source = createYDBIDBProvider('ydb-test-01-empty', doc)
    await new Promise<void>(resolve => {
      doc.once('sync', () => {
        performance.mark('sync-end')
        const perf = performance.measure('sync', 'sync', 'sync-end')
        if (!isFirst) {
          console.log('ydb loading speed', perf.duration)
        }
        source.disconnect()
        resolve()
      })

      source.connect()
    })
  }

  {
    performance.mark('sync')
    const doc = new Doc({
      guid: 'toeverything-test-01-empty'
    })
    await new Promise<void>(resolve => {
      const provider = createIndexedDBProvider(doc,
        'toeverything-test-01-empty')
      provider.connect()
      doc.once('sync', () => {
        performance.mark('sync-end')
        const perf = performance.measure('sync', 'sync', 'sync-end')
        if (!isFirst) {
          console.log('toeverything loading speed', perf.duration)
        }
        provider.disconnect()
        resolve()
      })

      provider.connect()
    })
  }

  isFirst = false
}

console.log('--- heavy ---')

{
  {
    performance.mark('sync')
    const doc = new Doc({
      guid: 'indexeddb-test-02-heavy'
    })
    const map = doc.getMap('map')
    for (let i = 0; i < 1e4; i++) {
      map.set(`${i}`, i)
    }
    const idbPersistence = new IndexeddbPersistence('indexeddb-test-02-heavy',
      doc)
    await idbPersistence.whenSynced.then(async () => {
      performance.mark('sync-end')
      const perf = performance.measure('sync', 'sync', 'sync-end')
      console.log('indexeddb loading speed', perf.duration)
      await idbPersistence.destroy()
    })
  }

  {
    performance.mark('sync')
    const doc = new Doc({
      guid: 'ydb-test-02-heavy'
    })
    const map = doc.getMap('map')
    for (let i = 0; i < 1e4; i++) {
      map.set(`${i}`, i)
    }
    const source = createYDBIDBProvider('ydb-test-02-heavy', doc)
    await new Promise<void>(resolve => {
      doc.once('sync', () => {
        performance.mark('sync-end')
        const perf = performance.measure('sync', 'sync', 'sync-end')
        console.log('ydb loading speed', perf.duration)
        source.disconnect()
        resolve()
      })

      source.connect()
    })
  }

  {
    performance.mark('sync')
    const doc = new Doc({
      guid: 'toeverything-test-02-heavy'
    })
    const map = doc.getMap('map')
    for (let i = 0; i < 1e4; i++) {
      map.set(`${i}`, i)
    }
    await new Promise<void>(resolve => {
      const provider = createIndexedDBProvider(doc,
        'toeverything-test-01-empty')
      provider.connect()
      doc.once('sync', () => {
        performance.mark('sync-end')
        const perf = performance.measure('sync', 'sync', 'sync-end')
        console.log('toeverything loading speed', perf.duration)
        provider.disconnect()
        resolve()
      })

      provider.connect()
    })
  }
}
