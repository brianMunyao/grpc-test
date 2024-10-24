import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const packageDef = protoLoader.loadSync('../grpc-protos/product.proto', {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

const productPackage = grpcObject.product;

// Load email proto to connect to the email service
const emailPackageDef = protoLoader.loadSync('../grpc-protos/email.proto', {});
const emailGrpcObject = grpc.loadPackageDefinition(emailPackageDef);
const emailPackage = emailGrpcObject.email;

// Create a client to connect to the email service running on port 5000
const emailClient = new emailPackage.EmailService(
	'localhost:5000',
	grpc.credentials.createInsecure()
);

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

	emailClient.sendEmail(
		{
			to: 'brianmunyao6@gmail.com', // Set this dynamically if needed
			subject: 'New Product Added',
			text: `A new product "${newProductData.name}" has been added to the catalog.`,
		},
		(err, response) => {
			if (err) {
				console.error('Error sending email:', err);
			} else {
				console.log('Email sent successfully:', response);
			}
		}
	);

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
