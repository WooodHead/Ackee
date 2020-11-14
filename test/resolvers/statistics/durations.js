'use strict'

const test = require('ava')
const listen = require('test-listen')

const server = require('../../../src/server')
const { connectToDatabase, fillDatabase, cleanupDatabase, disconnectFromDatabase } = require('../_utils')
const { getStats } = require('./_utils')

const base = listen(server)

test.before(connectToDatabase)
test.beforeEach(fillDatabase)
test.afterEach.always(cleanupDatabase)
test.after.always(disconnectFromDatabase)

const macro = async (t, variables, assertions) => {
	const statistics = await getStats({
		base,
		token: t.context.token.id,
		domainId: t.context.domain.id,
		fragment: `
			durations(interval: ${ variables.interval }) {
				id
				count
			}
		`
	})

	assertions(t, statistics.durations)
}

macro.title = (providedTitle, opts) => `fetch ${ Object.values(opts).join(' and ') } durations`

test(macro, {
	interval: 'DAILY'
}, (t, durations) => {
	t.is(durations.length, 14)
	t.is(durations[0].count, 60 * 1000)
})

test(macro, {
	interval: 'MONTHLY'
}, (t, durations) => {
	t.is(durations.length, 14)
	t.is(durations[0].count, 60 * 1000)
})

test(macro, {
	interval: 'YEARLY'
}, (t, durations) => {
	t.is(durations.length, 14)
	t.is(durations[0].count, 60 * 1000)
})