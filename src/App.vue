<template>
			
	<router-view v-slot="{ Component, route }">
		<component :is="Component" :key="route.path" />
	</router-view>	

	<Loader />
</template>

<script setup>
import Loader from '@/views/Loader.vue';

</script>

