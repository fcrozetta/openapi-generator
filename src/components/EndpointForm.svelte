<script lang="ts">
	import { endpoints, globalTags } from '../store'; // Import globalTags
	import EndpointList from './EndpointList.svelte';
	import { get } from 'svelte/store';
	import type { Header, Endpoint, Response } from '../types';

	let method: string = 'GET';
	let url: string = '/api/';
	let headers: Header[] = [{ key: 'Content-Type', value: 'application/json' }];
	let inputExample: string = '{}';
	let newTag = ''; // New tag input field
	let selectedTags: string[] = [];
	let responses: Response[] = [];
	let editingIndex: number | null = null;
	let editingResponseIndex: number | null = null; // Track the index of the response being edited

	// Temporary fields for adding a new response
	let responseCode = '';
	let responseDescription = '';
	let responseExample = '';

	// Function to add a new global tag
	const addGlobalTag = () => {
		if (newTag && !get(globalTags).includes(newTag)) {
			globalTags.update((tags) => [...tags, newTag]);
		}
		newTag = ''; // Clear the input after adding
	};

	// Function to add or update a response
	const saveResponse = () => {
		if (editingResponseIndex !== null) {
			// Update an existing response
			responses[editingResponseIndex] = {
				responseCode,
				responseDescription,
				outputExample: responseExample
			};
			editingResponseIndex = null; // Clear editing state
		} else {
			// Add a new response
			responses = [
				...responses,
				{ responseCode, responseDescription, outputExample: responseExample }
			];
		}
		// Clear response input fields after saving
		responseCode = '';
		responseDescription = '';
		responseExample = '';
	};

	// Function to populate the form with the response data for editing
	const editResponse = (index: number) => {
		const response = responses[index];
		responseCode = response.responseCode;
		responseDescription = response.responseDescription;
		responseExample = response.outputExample;
		editingResponseIndex = index; // Set the index of the response being edited
	};

	const removeResponse = (index: number) => {
		responses = responses.filter((_, i) => i !== index);
	};

	const saveEndpoint = () => {
		if (editingIndex !== null) {
			endpoints.update((items) => {
				const updatedItems = [...items];
				updatedItems[editingIndex] = {
					method,
					url,
					headers,
					inputExample,
					responses,
					tags: selectedTags
				};
				return updatedItems;
			});
			editingIndex = null;
		} else {
			endpoints.update((items) => [
				...items,
				{ method, url, headers, inputExample, responses, tags: selectedTags }
			]);
		}
		clearForm();
	};

	const clearForm = () => {
		method = 'GET';
		url = '/api/';
		headers = [{ key: 'Content-Type', value: 'appliaction/json' }];
		inputExample = '{}';
		selectedTags = [];
		responses = [];
		editingIndex = null;
	};

	function handleEdit(event) {
		const index = event.detail.index;
		const endpoint = get(endpoints)[index];
		method = endpoint.method;
		url = endpoint.url;
		headers = [...endpoint.headers];
		inputExample = endpoint.inputExample;
		selectedTags = [...endpoint.tags];
		responses = [...endpoint.responses];
		editingIndex = index;
	}

	function handleDelete(event) {
		const index = event.detail.index;
		endpoints.update((items) => items.filter((_, i) => i !== index));
	}

	const addHeader = () => {
		headers = [...headers, { key: '', value: '' }];
	};

	const toggleTag = (tag: string) => {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	};
	// Determine if the input example field should be shown
	$: showInputExample = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
</script>

<!-- Form for Adding/Updating Endpoint -->
<form class="mt-8 space-y-4" on:submit|preventDefault={saveEndpoint}>
	<!-- Method selection and URL input (unchanged) -->
	<div class="flex items-center space-x-4">
		<label for="method" class="w-1/4 font-semibold">Method:</label>
		<select id="method" class="flex-1 rounded-md border p-2" bind:value={method}>
			<option>GET</option>
			<option>POST</option>
			<option>PUT</option>
			<option>DELETE</option>
		</select>
	</div>

	<div class="flex items-center space-x-4">
		<label for="url" class="w-1/4 font-semibold">URL:</label>
		<input
			id="url"
			class="flex-1 rounded-md border p-2"
			type="text"
			bind:value={url}
			placeholder="/api/example"
		/>
	</div>

	<!-- Headers Section -->
	<div class="space-y-2">
		<label class="font-semibold">Headers:</label>
		{#each headers as header, i}
			<div class="flex space-x-4">
				<input
					class="flex-1 rounded-md border p-2"
					type="text"
					bind:value={header.key}
					placeholder="Header Key"
				/>
				<input
					class="flex-1 rounded-md border p-2"
					type="text"
					bind:value={header.value}
					placeholder="Header Value"
				/>
				<button
					type="button"
					class="rounded-md bg-red-500 p-1 text-white"
					on:click={() => (headers = headers.filter((_, index) => index !== i))}
				>
					Remove
				</button>
			</div>
		{/each}
		<button type="button" class="text-blue-500" on:click={addHeader}>Add Header</button>
	</div>
	<!-- Input Example Field (conditionally rendered) -->
	{#if showInputExample}
		<div>
			<label for="inputExample" class="font-semibold">Input Example (JSON):</label>
			<textarea id="inputExample" class="w-full rounded-md border p-2" bind:value={inputExample}
			></textarea>
		</div>
	{/if}

	<!-- Responses Section -->
	<div>
		<label class="font-semibold">Responses:</label>
		{#each responses as response, i}
			<div class="mt-2 rounded-md border bg-gray-50 p-2">
				<div class="flex items-center space-x-4">
					<span class="rounded bg-gray-200 px-2 font-mono text-gray-700"
						>{response.responseCode}</span
					>
					<span>{response.responseDescription}</span>
					<button
						type="button"
						class="rounded-md bg-blue-500 p-1 text-white"
						on:click={() => editResponse(i)}
					>
						Edit
					</button>
					<button
						type="button"
						class="rounded-md bg-red-500 p-1 text-white"
						on:click={() => removeResponse(i)}
					>
						Remove
					</button>
				</div>
				<pre class="rounded bg-gray-100 p-2 text-sm">{response.outputExample}</pre>
			</div>
		{/each}

		<!-- Form Fields for Adding/Editing Responses -->
		<div class="mt-4 flex space-x-4">
			<input
				class="flex-1 rounded-md border p-2"
				type="text"
				placeholder="Response Code"
				bind:value={responseCode}
			/>
			<input
				class="flex-1 rounded-md border p-2"
				type="text"
				placeholder="Description"
				bind:value={responseDescription}
			/>
		</div>
		<textarea
			class="mt-2 w-full rounded-md border p-2"
			placeholder="Response Example (JSON)"
			bind:value={responseExample}
		></textarea>
		<button
			type="button"
			class="mt-2 rounded-md bg-blue-500 p-2 text-white"
			on:click={saveResponse}
		>
			{editingResponseIndex !== null ? 'Update Response' : 'Add Response'}
		</button>
	</div>

	<!-- Define global tags -->
	<div>
		<label for="tags" class="font-semibold">Define New Tag:</label>
		<div class="flex items-center space-x-2">
			<input
				id="tags"
				class="flex-1 rounded-md border p-2"
				type="text"
				bind:value={newTag}
				placeholder="Add a global tag"
			/>
			<button type="button" class="rounded-md bg-blue-500 p-2 text-white" on:click={addGlobalTag}
				>Add Global Tag</button
			>
		</div>
		<div class="mt-2">
			<span>Available Tags:</span>
			{#each $globalTags as tag}
				<span class="mr-2 rounded-md bg-gray-200 p-2">{tag}</span>
			{/each}
		</div>
	</div>

	<!-- Select tags for this endpoint -->
	<div>
		<label for="endpoint-tags" class="font-semibold">Tags for This Endpoint:</label>
		<div id="endpoint-tags" class="mt-2 flex flex-wrap">
			{#each $globalTags as tag}
				<button
					type="button"
					class="m-1 rounded-md p-2 {selectedTags.includes(tag)
						? 'bg-green-500 text-white'
						: 'bg-gray-200'}"
					on:click={() => toggleTag(tag)}
				>
					{tag}
				</button>
			{/each}
		</div>
	</div>

	<button type="submit" class="rounded-md bg-green-500 p-2 text-white">
		{editingIndex !== null ? 'Update Endpoint' : 'Add Endpoint'}
	</button>
</form>

<!-- Import and use the EndpointList component -->
<EndpointList endpoints={$endpoints} on:edit={handleEdit} on:delete={handleDelete} />
