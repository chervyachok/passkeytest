<template>
	<div class="container mt-2 justify-content-center text-center">
		<div class="row justify-content-center">
			<div class="col-6">
				<div class="mb-3">
					<label for="username" class="form-label">Username</label>
					<input type="text" class="form-control" id="username" placeholder="name" v-model="form.username">
				</div>
				<div class="mb-3">
					<label for="mail" class="form-label">Email</label>
					<input type="email" class="form-control" id="mail" placeholder="name@example.com" v-model="form.email">
				</div>

				<button type="button" class="btn btn-primary" @click="send()">Send</button>
			</div>

		</div>
		
	</div>
</template>

<script setup>
import { onMounted, ref, inject } from 'vue'; 
import ecoTaxi from '@/utils/ecoTaxi'

const form = ref({
	username: null,
	email: null
})

const $loader = inject('$loader')

onMounted(() => {
	authorize()
})

const authorize = async () => {
	$loader.show()
	try {
		console.log('ecoTaxi.isDataStored()', ecoTaxi.isDataStored())
		if (!ecoTaxi.isDataStored()) return

		const pinCode = prompt("Enter your PIN:");
		if (pinCode !== null) {
			const data = await ecoTaxi.getData(pinCode)
			console.log('ecoTaxi user data', data)
			form.value = data.payload	
		}
	} catch (error) {
		console.log(error)		
	}
	$loader.hide()
}

async function send() {  
	$loader.show()
	try {
		const pinCode = prompt("Set your PIN:");
		if (pinCode !== null) {
			await ecoTaxi.registerPassKey(pinCode, form.value)
		}
	} catch (error) {
		console.log(error)
	}	
	$loader.hide()
}
</script>