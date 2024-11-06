<script lang="ts">
	import type { Endpoint } from '../types';
	import { createEventDispatcher } from 'svelte';

	export let endpoints: Endpoint[] = [];
	const dispatch = createEventDispatcher();

	// Method background color based on HTTP method type
	function methodColor(method: string): string {
		switch (method) {
			case 'GET':
				return 'bg-blue-500';
			case 'POST':
				return 'bg-green-500';
			case 'PUT':
				return 'bg-yellow-500';
			case 'DELETE':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	}

	// Extract Content-Type values from headers
	function getContentTypes(headers) {
		return headers
			.filter((header) => header.key.toLowerCase() === 'content-type')
			.map((header) => header.value);
	}

	// Emit events to the parent for editing and deleting
	const editEndpoint = (index: number) => dispatch('edit', { index });
	const deleteEndpoint = (index: number) => dispatch('delete', { index });
</script>

<!-- List of Existing Endpoints in OpenAPI Style -->
<div class="mt-8 space-y-4">
	<h2 class="text-lg font-semibold">Existing Endpoints</h2>

	{#each endpoints as endpoint, index}
		<details class="mb-4 rounded-md border shadow-md">
			<summary class="flex cursor-pointer items-center p-4 hover:bg-gray-100">
				<span
					class="rounded-full px-3 py-1 text-sm font-semibold text-white {methodColor(
						endpoint.method
					)}"
				>
					{endpoint.method}
				</span>
				<span class="ml-3 font-mono text-gray-900">{endpoint.url}</span>
				<div class="ml-auto flex space-x-2">
					<!-- Edit and Delete Buttons -->
					<button
						class="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
						on:click|stopPropagation={() => editEndpoint(index)}
					>
						<!-- Edit Icon -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 5h-6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-6m-3-7l3 3m-8 8L16 7"
							/>
						</svg>
					</button>
					<button
						class="rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
						on:click|stopPropagation={() => deleteEndpoint(index)}
					>
						<!-- Delete Icon -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</summary>

			<!-- Parameters Section -->
			<div class="border-t bg-gray-50 p-4">
				<h3 class="text-sm font-semibold text-gray-700">Headers</h3>
				{#if endpoint.headers.length > 0}
					<div class="mt-1">
						{#each endpoint.headers as header}
							<div class="flex items-center space-x-2">
								<span class="rounded bg-gray-200 px-2 font-mono text-gray-700">{header.key}</span>
								<span>{header.value}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-gray-500">No Headers</p>
				{/if}
			</div>

			<!-- Responses Section -->
			<div class="border-t bg-gray-50 p-4">
				<h3 class="text-sm font-semibold text-gray-700">Responses</h3>
				<div class="mt-2">
					<div class="flex items-center space-x-4">
						<span class="rounded bg-gray-200 px-2 font-mono text-gray-700"
							>{endpoint.responses[0].responseCode}</span
						>
						<span>{endpoint.responses[0].responseDescription}</span>
					</div>

					<!-- Media Type Dropdown based on Content-Type headers -->
					<div class="mt-2">
						<label class="text-sm text-gray-600">Media type</label>
						<select class="mt-1 block w-full rounded-md border bg-white p-2 text-sm">
							{#each getContentTypes(endpoint.headers) as contentType}
								<option>{contentType}</option>
							{/each}
						</select>
						<p class="mt-1 text-xs text-gray-500">Controls Accept header.</p>
					</div>

					<!-- Output Example -->
					{#if endpoint.responses[0].outputExample}
						<div class="mt-2">
							<h4 class="text-xs font-semibold text-gray-700">Example Value</h4>
							<pre class="overflow-auto rounded bg-gray-900 p-2 text-sm text-white">{JSON.stringify(
									JSON.parse(endpoint.responses[0].outputExample),
									null,
									2
								)}</pre>
						</div>
					{/if}
				</div>
			</div>

			<!-- Tags Section -->
			{#if endpoint.tags.length > 0}
				<div class="border-t bg-gray-50 p-4">
					<h3 class="text-sm font-semibold text-gray-700">Tags</h3>
					<div class="mt-1 flex flex-wrap">
						{#each endpoint.tags as tag}
							<span
								class="mb-1 mr-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
								>{tag}</span
							>
						{/each}
					</div>
				</div>
			{/if}
		</details>
	{/each}
</div>
