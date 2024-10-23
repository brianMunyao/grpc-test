import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const packageDef = protoLoader.loadSync('product.proto', {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

const productPackage = grpcObject.product;

// simulate db
const products = [];
let idCounter = 1;

const createProduct = (call, callback) => {
	const data = call.request;

	const newProductData = {
		...data,
		id: idCounter++,
	};

	products.push(newProductData);

	return callback(null, { product: newProductData });
};

const readProduct = (call, callback) => {
	const productId = call.request.id;

	const product = products.find((prod) => prod.id === productId);

	if (product) {
		return callback(null, { product });
	} else {
		return callback({
			code: grpc.status.NOT_FOUND,
			details: 'Product not found.',
		});
	}
};

const readProducts = (call, callback) => {
	return callback(null, { products });
};

const updateProduct = (call, callback) => {
	const productToUpdate = call.request;

	const indexOfproductToUpdate = products.findIndex(
		(prod) => prod.id === productToUpdate.id
	);

	if (indexOfproductToUpdate === -1)
		return callback({
			code: grpc.status.NOT_FOUND,
			details: 'Product Not Found.',
		});

	const selectedProduct = products[indexOfproductToUpdate];

	const updatedProduct = {
		id: selectedProduct.id,
		name: productToUpdate.name || selectedProduct.name,
		description: productToUpdate.description || selectedProduct.description,
		price: productToUpdate.price || selectedProduct.price,
		category: productToUpdate.category || selectedProduct.category,
	};

	products.splice(indexOfproductToUpdate, 1, updatedProduct);

	return callback(null, { product: productToUpdate });
};

const deleteProduct = (call, callback) => {
	const productId = call.request.id;

	const indexOfproductToDelete = products.findIndex(
		(prod) => prod.id === productId
	);

	if (indexOfproductToDelete === -1)
		return callback({
			code: grpc.status.NOT_FOUND,
			details: 'Product Not Found.',
		});

	products.splice(indexOfproductToDelete, 1);

	return callback(null, { deleted: true });
};

const server = new grpc.Server({});
server.addService(productPackage.ProductService.service, {
	createProduct,
	readProduct,
	readProducts,
	updateProduct,
	deleteProduct,
});

server.bindAsync(
	'0.0.0.0:4000',
	grpc.ServerCredentials.createInsecure(),
	() => {
		// server started
	}
);
