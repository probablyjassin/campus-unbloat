<script lang="ts">
	import type { Writable } from 'svelte/store';

	import type { MealGroup } from '../types';
	import MealViewAccordion from './MealViewAccordion.svelte';
	import MediaQuery from 'svelte-media-queries';
	import { createEventDispatcher } from 'svelte';
	import MealGroupContainer from './MealGroupContainer.svelte';

	export let twoColumn = false;
	export let expandedMealCategories: Writable<Array<string>>;
	export let mealGroups: Array<MealGroup>;

	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.visibility = 'hidden';
	document.body.appendChild(container);

	let column1: MealGroup[];
	let column2: MealGroup[];
	$: splitGroups(mealGroups);

	async function splitGroups(mealGroups: MealGroup[]) {
		if (!twoColumn) return;

		column1 = [];
		column2 = [];

		let splitContainerHeight1: number = 0;
		let splitContainerHeight2: number = 0;

		for (const mealGroup of mealGroups) {
			new MealGroupContainer({
				props: { mealGroup, gradientColour: undefined },
				target: container
			});

			if (!splitContainerHeight1 || splitContainerHeight1 <= splitContainerHeight2) {
				column1.push(mealGroup);
				splitContainerHeight1 += container.clientHeight;
			} else {
				column2.push(mealGroup);
				splitContainerHeight2 += container.clientHeight;
			}

			container.innerHTML = '';
		}
	}

	const dispatch = createEventDispatcher();
</script>

<!-- hacky -->
<MediaQuery query="(min-width: 640px)" let:matches>
	{#if mealGroups.length === 0}
		<p class="pt-2 text-center">Keine Gerichte verfügbar.</p>
	{:else if twoColumn && matches && mealGroups.length > 1}
		<div class="grid grid-cols-2 gap-3">
			<MealViewAccordion alwaysExpanded={true} mealGroups={column1} {expandedMealCategories} />
			<MealViewAccordion alwaysExpanded={true} mealGroups={column2} {expandedMealCategories} />
		</div>
	{:else}
		<MealViewAccordion
			{mealGroups}
			{expandedMealCategories}
			on:mealGroupClicked={() => dispatch('mealGroupClicked')}
		/>
	{/if}
</MediaQuery>
