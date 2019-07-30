// 1. Write unit test

const someOrder = {
	items: [
		{ name: 'Dragon food', price: 8, quantity: 8 },
		{ name: 'Dragon cage (small)', price: 800, quantity: 2 },
		//{ name: 'Shipping', price: 40, shipping: true }
	]
}

if(orderTotal(someOrder) !== 808) {
	throw new Error("Check fail: Happy path.")
}


// 2. Write function

const orderTotal = order => order.items.reduce((prev, cur) => prev + (cur.price * cur.quantity), 0)

// Add a comment`
