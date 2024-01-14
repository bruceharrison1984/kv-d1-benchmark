export interface Env {
	KV: KVNamespace;
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		console.log('bootstrap D1 if necessary');
		await env.DB.exec('CREATE TABLE IF NOT EXISTS benchmark(NAME TEXT NOT NULL)');

		const kv_insert = await measureTime(async () => await env.KV.put('test', 'some-value'));
		const d1_insert = await measureTime(async () => await env.DB.exec(`INSERT INTO benchmark (NAME) VALUES ('test')`));

		const kv_read = await measureTime(async () => await env.KV.get('test'));
		const d1_read = await measureTime(async () => await env.DB.exec(`SELECT * FROM benchmark`));

		const kv_insert_and_propagate = await measureTime(async () => {
			const id = crypto.randomUUID();
			await env.KV.put(id, 'some-value');

			let result = null;
			while (!result) {
				result = await env.KV.get(id);
			}
		});

		const d1_insert_and_propagate = await measureTime(async () => {
			const id = crypto.randomUUID();
			await measureTime(async () => await env.DB.exec(`INSERT INTO benchmark (NAME) VALUES ('${id}')`));

			let result = null;
			while (!result) {
				result = await await env.DB.exec(`SELECT * FROM benchmark WHERE NAME = '${id}'`);
			}
		});

		return new Response(JSON.stringify({ kv_insert, kv_read, kv_insert_and_propagate, d1_insert, d1_read, d1_insert_and_propagate }));
	},
};

const measureTime = async (func: () => any | Promise<any>) => {
	const start = performance.now();
	await func();
	return `${performance.now() - start}ms`;
};
