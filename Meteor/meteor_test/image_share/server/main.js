import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Images } from '../collections/images';

Meteor.startup(() => {
  if (Images.find().count() == 0) {
    for (var i = 1; i < 23; i++) {
      Images.insert(
        {
          img_src: "img_" + i + ".jpg",
          img_alt: "image number " + i
        }
      );
    }// end of for insert images
    // count the images!
    console.log("startup.js says: " + Images.find().count());
  }// end of if have no images

  console.log(Images.find().count());
});