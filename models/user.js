const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	matric_number : {
		type: Number,
        maxLength: 8,
        unique:true,
		required : [true, 'Must provide matric number']
	},
	email: {
		type: String,
		unique: true,
		trim: true,
		required: [true, 'Must have email'],
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email'],
	},
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: [true, 'Please enter gender']
    },
    date_of_birth: {
        type: String,
		required: [true, 'Please enter D.O.B']
    },
    phone_number: {
        type: String,
        minLength: 11
    },
	year_of_graduation: {
		type: String,
		enum: ['2020/2021', '2019/2020', '2018/2019'],
		default: '2020/2021'
	},
    set:{
        type: String,
		default: "3rd Set"
    },
    profile_img: {
        type: String,
		default: ""
    },
	cloudinary_id:{
		type: String
	},
    location: {
        type: String,
        default: ""
    },
    facebook: {
        type: String,
        default: ""
    },
    linkedin: {
        type: String,
        default: ""
    },
    twitter: {
        type: String,
        default: ""
    },
    occupation: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
	password: {
		type: String,
		required: [true, 'Please enter password'],
		minLength: 8,
		select: false,
	},
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm password'],
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: 'Passwords mismatch',
		},
    },
	passwordResetToken: String,
	passwordResetExpires: Date,
	confirmEmailToken: String,
	active: {
		type: Boolean,
		default: false,
		select: false,
	},
	loggedOut: {
		type: Boolean,
		default: true,
		select: false,
	}
}, {timestamps: true});

//Document middleware for encrpting password
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

//Document middleware for indicating password change
userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) {
		return next();
	}
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

//this creates a function available to all users used to compare user password to another
userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

//this creates a schema function that makes the password reset token
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

//this creates a schema function that makes the email confirm token
userSchema.methods.createEmailConfirmToken = function () {
	const confirmToken = crypto.randomBytes(32).toString('hex');

	this.confirmEmailToken = crypto
		.createHash('sha256')
		.update(confirmToken)
		.digest('hex');

	return confirmToken;
};

// this creates a schema function that makes the determine set function
userSchema.methods.determineSet = function () {
	let y_o_g = this.year_of_graduation
	let set = this.set 


	if(y_o_g.startsWith('2020')){
		return (set = "3rd set")
	}
	else if(y_o_g.startsWith('2019')){
		return (set = "2nd set")
	}
	else if(y_o_g.startsWith('2018')){
		return (set = "1st set")
	}
	else{
		return (set = "Invalid set")

	}
}

module.exports = mongoose.model('User', userSchema);
