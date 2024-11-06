<script lang="ts">
	import EndpointForm from '../components/EndpointForm.svelte';
	import { endpoints, generateOpenApiSpec } from '../store';
	import { onDestroy } from 'svelte';

	let openApiSpec = '';

	// Subscribe to the `endpoints` store and update `openApiSpec` when it changes
	const unsubscribe = endpoints.subscribe(() => {
		openApiSpec = JSON.stringify(generateOpenApiSpec(), null, 2);
	});

	// Clean up the subscription when the component is destroyed
	onDestroy(unsubscribe);
</script>

<main class="mx-auto max-w-3xl p-8">
	<h1 class="mb-4 text-2xl font-bold">OpenAPI Specification Generator</h1>
	<EndpointForm />

	<h2 class="mb-2 mt-8 text-xl font-semibold">Generated OpenAPI JSON Spec</h2>
	<textarea
		class="w-full rounded-md border border-gray-300 p-4"
		readonly
		rows="20"
		bind:value={openApiSpec}
	></textarea>

	<button
		class="mt-4 rounded-md bg-blue-500 p-2 text-white"
		on:click={() => navigator.clipboard.writeText(openApiSpec)}
	>
		Copy to Clipboard
	</button>
</main>
