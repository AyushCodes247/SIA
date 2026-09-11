import { asyncHandler } from "@utils/essential.util.js";

const chat = asyncHandler(async (req,res) => {
    const { query } = req.body;
    const file = req.files;

    /*
    1. IMAGE
    {
  fieldname: 'image',
  originalname: 'oskar-smethurst-B1GtwanCbiw-unsplash.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  path: '/Users/ayushsharma/SIA/backend/src/uploads/1789134072360-ff2ee637-2478-4814-9db4-8495a1f24269.jpg',
  destination: '/Users/ayushsharma/SIA/backend/src/uploads',
  filename: '1789134072360-ff2ee637-2478-4814-9db4-8495a1f24269.jpg',
  size: 1203746
}
  2. pdf document:
  file: [
    {
      fieldname: 'file',
      originalname: 'ila5sols.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      path: '/Users/ayushsharma/SIA/backend/src/uploads/1789139749328-a9b68599-752d-4a97-bdef-db7716cf7d46.pdf',
      destination: '/Users/ayushsharma/SIA/backend/src/uploads',
      filename: '1789139749328-a9b68599-752d-4a97-bdef-db7716cf7d46.pdf',
      size: 4798988
    }
  ]
}

3. pdf + image :
 {
  file: [
    {
      fieldname: 'file',
      originalname: 'ila5sols.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      path: '/Users/ayushsharma/SIA/backend/src/uploads/1789139843359-6f46b247-aee1-46f7-8ab8-23288bf8976c.pdf',
      destination: '/Users/ayushsharma/SIA/backend/src/uploads',
      filename: '1789139843359-6f46b247-aee1-46f7-8ab8-23288bf8976c.pdf',
      size: 4798988
    }
  ],
  image: [
    {
      fieldname: 'image',
      originalname: 'oskar-smethurst-B1GtwanCbiw-unsplash.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      path: '/Users/ayushsharma/SIA/backend/src/uploads/1789139843366-c53c12c4-064e-475c-a12a-297bba6c9c20.jpg',
      destination: '/Users/ayushsharma/SIA/backend/src/uploads',
      filename: '1789139843366-c53c12c4-064e-475c-a12a-297bba6c9c20.jpg',
      size: 1203746
    }
  ]
}

    */


});

export default chat;