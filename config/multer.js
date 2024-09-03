const   uniqid = require('uniqid'),
        multer = require('multer')
;


const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './uploads/images');    
    },
    filename: function(req, file, callback){
        const originalnameSplit = file.originalname.split('.');
        const name = new Date().toISOString() + uniqid() +'.'+ originalnameSplit[originalnameSplit.length - 1]
        callback(null, name.split(' ').join('_')  );
    }
})

const fileFilter = (req, file, callback) => {
    //reject a file
    const typeFile = file.mimetype.split('/')[0];
    if(typeFile  === 'image' ){
        callback(null, true);
    } else {
        const err = new Error('invalid image type');
        err.status = 401;
        callback(err, false);
    }
}

const uploadImage = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 20
    },
    fileFilter
});


module.exports = uploadImage;