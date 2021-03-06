import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import './main.html';
import { Images } from '../lib/collections';

Router.configure({
    layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
    this.render('welcome', {
        to:'main'
    });
});

Router.route('/images', function () {
    this.render('navbar', {
        to:"navbar"
    });
    this.render('images', {
        to:"main"
    });
});

Router.route('/image/:_id', function () {
    this.render('image', {
        to:"main",
        data:function(){
            return Images.findOne({_id:this.params._id});
        },
    });
});

//infinite scroll
Session.set("imageLimit", 8);
lastScrollTop = 0
$(window).scroll(function (event) {
    Session.set("imageCount", 1);
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
        var scrollTop = $(this).scrollTop();

        if (scrollTop > lastScrollTop) {
            Session.set('imageLimit', Session.get('imageLimit') + 1);
        }

        lastScrollTop = scrollTop;
    }
});

Template.images.helpers({
    images: function () {
        if (Session.get("userFilter")) {
            return Images.find({ createdBy: Session.get("userFilter") }, { sort: { createdOn: -1, rating: -1 } });
        } else {
            return Images.find({}, { sort: { createdOn: -1, rating: -1 }, limit: Session.get("imageLimit") });
        }
    },

    filtering_images: function () {
        return Session.get("userFilter");
    },

});

Template.body.helpers({
    username:
        function () {
            if (Meteor.user()) {
                return Meteor.user().username;
            }
        }
});

//acoounts config
Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
});

Template.images.events({
    'click .js-image': function (event) {
        $(event.target).css("width", "50px");
    },
    'click .js-del-image': function (event) {
        var image_id = this._id;
        console.log(image_id);
        // use jquery to hide the image component
        // then remove it at the end of the animation
        $("#" + image_id).hide('slow', function () {
            Images.remove({ "_id": image_id });
        })
    },
    'click .js-rate-image': function (event) {
        var rating = $(event.currentTarget).data("userrating");
        console.log(rating);
        var image_id = this.id;
        console.log(image_id);

        Images.update({ _id: image_id },
            { $set: { rating: rating } });
    },

    'click .js-show-image-form': function (event) {
        $("#image_add_form").modal('show');
    },

    'click .js-set-image-filter': function (event) {
        Session.set("userFilter", this.createdBy);
    },

    'click .js-remove-filter': function (event) {
        Session.set("userFilter", undefined);
    },

});

Template.image_add_form.events({
    'submit .js-add-image': function (event) {
        var img_src, img_alt;
        img_src = event.target.img_src.value;
        img_alt = event.target.img_alt.value;
        console.log("src: " + img_src + " alt:" + img_alt);

        if (Meteor.user()) {
            Images.insert({
                img_src: img_src,
                img_alt: img_alt,
                createdOn: new Date(),
                createdBy: Meteor.user().username
            });
        }
        $("#image_add_form").modal('show');
        return false;
    }
});

