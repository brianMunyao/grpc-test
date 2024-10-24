import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { emailService } from './email.service.js';

const packageDef = protoLoader.loadSync('../grpc-protos/email.proto', {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

const emailPackage = grpcObject.email;

const sendEmail = async (call, callback) => {
	try {
		const to = call.request.to;
		const subject = call.request.subject;
		const text = call.request.text;

		await emailService.sendEmail({
			subject,
			text,
			to,
		});

		return callback(null, {
			success: true,
			msg: 'email set successfully',
		});
	} catch (e) {
		return callback({
			code: grpc.status.INTERNAL,
			details: 'An error occured: ' + e,
		});
	}
};

const server = new grpc.Server({});

server.addService(emailPackage.EmailService.service, {
	sendEmail,
});

server.bindAsync(
	'0.0.0.0:5000',
	grpc.ServerCredentials.createInsecure(),
	() => {
		// server started
	}
);
