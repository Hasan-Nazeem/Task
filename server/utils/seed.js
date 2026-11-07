const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const setupDB = require('./db');
const { ROLES } = require('../constants');

const User = require('../models/user');
const Brand = require('../models/brand');
const Product = require('../models/product');
const Category = require('../models/category');


const args = process.argv.slice(2);

const email = args[0];
const password = args[1];



const brandsData = [
  "Apple",
  "Samsung",
  "Nike",
  "Adidas",
  "Sony",
  "Dell",
  "HP",
  "Canon",
  "Puma",
  "Levis"
];


const categoriesData = [
  "Electronics",
  "Fashion",
  "Footwear",
  "Sports",
  "Home & Kitchen",
  "Beauty",
  "Watches",
  "Cameras",
  "Furniture",
  "Accessories"
];



const productsData = [


/* ================= APPLE ================= */


{
 name:"iPhone 15 Pro",
 brand:"Apple",
 category:"Electronics",
 price:1200,
 imageUrl:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab"
},

{
 name:"MacBook Air M3",
 brand:"Apple",
 category:"Electronics",
 price:1500,
 imageUrl:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
},

{
 name:"iPad Pro",
 brand:"Apple",
 category:"Electronics",
 price:1000,
 imageUrl:"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0"
},

{
 name:"Apple Watch Series 9",
 brand:"Apple",
 category:"Watches",
 price:450,
 imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30"
},

{
 name:"AirPods Pro",
 brand:"Apple",
 category:"Accessories",
 price:250,
 imageUrl:"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1"
},

{
 name:"Mac Mini",
 brand:"Apple",
 category:"Electronics",
 price:800,
 imageUrl:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
},

{
 name:"iMac Desktop",
 brand:"Apple",
 category:"Electronics",
 price:1700,
 imageUrl:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
},

{
 name:"Magic Keyboard",
 brand:"Apple",
 category:"Accessories",
 price:150,
 imageUrl:"https://images.unsplash.com/photo-1587829741301-dc798b83add3"
},

{
 name:"Apple Pencil",
 brand:"Apple",
 category:"Accessories",
 price:120,
 imageUrl:"https://images.unsplash.com/photo-1586210579191-33b45e38fa2c"
},

{
 name:"iPhone Leather Case",
 brand:"Apple",
 category:"Accessories",
 price:50,
 imageUrl:"https://images.unsplash.com/photo-1601593346740-925612772716"
},



/* ================= SAMSUNG ================= */


{
 name:"Samsung Galaxy S24 Ultra",
 brand:"Samsung",
 category:"Electronics",
 price:1300,
 imageUrl:"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c"
},

{
 name:"Samsung Galaxy S23",
 brand:"Samsung",
 category:"Electronics",
 price:900,
 imageUrl:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
},

{
 name:"Samsung Galaxy Tab S9",
 brand:"Samsung",
 category:"Electronics",
 price:800,
 imageUrl:"https://images.unsplash.com/photo-1587033411391-5d9e51cce126"
},

{
 name:"Samsung Galaxy Watch",
 brand:"Samsung",
 category:"Watches",
 price:300,
 imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30"
},

{
 name:"Samsung Smart Monitor",
 brand:"Samsung",
 category:"Electronics",
 price:500,
 imageUrl:"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"
},

{
 name:"Samsung Soundbar",
 brand:"Samsung",
 category:"Electronics",
 price:400,
 imageUrl:"https://images.unsplash.com/photo-1545454675-3531b543be5d"
},

{
 name:"Samsung Wireless Charger",
 brand:"Samsung",
 category:"Accessories",
 price:60,
 imageUrl:"https://images.unsplash.com/photo-1586953208448-b95a79798f07"
},

{
 name:"Samsung OLED TV",
 brand:"Samsung",
 category:"Electronics",
 price:1800,
 imageUrl:"https://images.unsplash.com/photo-1593784991095-a205069470b6"
},

{
 name:"Samsung Refrigerator",
 brand:"Samsung",
 category:"Home & Kitchen",
 price:1200,
 imageUrl:"https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5"
},

{
 name:"Samsung Washing Machine",
 brand:"Samsung",
 category:"Home & Kitchen",
 price:900,
 imageUrl:"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1"
},

/* ================= NIKE ================= */


{
 name:"Nike Air Max Running Shoes",
 brand:"Nike",
 category:"Footwear",
 price:150,
 imageUrl:"https://images.unsplash.com/photo-1542291026-7eec264c27ff"
},

{
 name:"Nike Sports T Shirt",
 brand:"Nike",
 category:"Fashion",
 price:45,
 imageUrl:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
},

{
 name:"Nike Training Shoes",
 brand:"Nike",
 category:"Footwear",
 price:130,
 imageUrl:"https://images.unsplash.com/photo-1460353581641-37baddab0fa2"
},

{
 name:"Nike Basketball Shoes",
 brand:"Nike",
 category:"Sports",
 price:180,
 imageUrl:"https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111"
},

{
 name:"Nike Running Jacket",
 brand:"Nike",
 category:"Fashion",
 price:100,
 imageUrl:"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3"
},

{
 name:"Nike Football Jersey",
 brand:"Nike",
 category:"Sports",
 price:80,
 imageUrl:"https://images.unsplash.com/photo-1517466787929-bc90951d0974"
},

{
 name:"Nike Sports Cap",
 brand:"Nike",
 category:"Fashion",
 price:35,
 imageUrl:"https://images.unsplash.com/photo-1588850561407-ed78c282e89b"
},

{
 name:"Nike Gym Bag",
 brand:"Nike",
 category:"Sports",
 price:70,
 imageUrl:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
},

{
 name:"Nike Training Shorts",
 brand:"Nike",
 category:"Fashion",
 price:40,
 imageUrl:"https://images.unsplash.com/photo-1506629905607-d9d1f5f3b8f5"
},

{
 name:"Nike Sports Watch",
 brand:"Nike",
 category:"Watches",
 price:200,
 imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30"
},



/* ================= ADIDAS ================= */


{
 name:"Adidas Ultraboost Shoes",
 brand:"Adidas",
 category:"Footwear",
 price:160,
 imageUrl:"https://images.unsplash.com/photo-1608231387042-66d1773070a5"
},

{
 name:"Adidas Running Shoes",
 brand:"Adidas",
 category:"Footwear",
 price:140,
 imageUrl:"https://images.unsplash.com/photo-1460353581641-37baddab0fa2"
},

{
 name:"Adidas Sports Jacket",
 brand:"Adidas",
 category:"Fashion",
 price:90,
 imageUrl:"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3"
},

{
 name:"Adidas Football Shoes",
 brand:"Adidas",
 category:"Sports",
 price:170,
 imageUrl:"https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111"
},

{
 name:"Adidas Training T Shirt",
 brand:"Adidas",
 category:"Fashion",
 price:40,
 imageUrl:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
},

{
 name:"Adidas Backpack",
 brand:"Adidas",
 category:"Accessories",
 price:60,
 imageUrl:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
},

{
 name:"Adidas Sports Cap",
 brand:"Adidas",
 category:"Fashion",
 price:30,
 imageUrl:"https://images.unsplash.com/photo-1588850561407-ed78c282e89b"
},

{
 name:"Adidas Gym Shoes",
 brand:"Adidas",
 category:"Footwear",
 price:120,
 imageUrl:"https://images.unsplash.com/photo-1542291026-7eec264c27ff"
},

{
 name:"Adidas Fitness Watch",
 brand:"Adidas",
 category:"Watches",
 price:250,
 imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30"
},

{
 name:"Adidas Sports Pants",
 brand:"Adidas",
 category:"Fashion",
 price:55,
 imageUrl:"https://images.unsplash.com/photo-1506629905607-d9d1f5f3b8f5"
},

/* ================= SONY ================= */


{
 name:"Sony WH-1000XM5 Headphones",
 brand:"Sony",
 category:"Electronics",
 price:350,
 imageUrl:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
},

{
 name:"Sony Bravia OLED TV",
 brand:"Sony",
 category:"Electronics",
 price:1800,
 imageUrl:"https://images.unsplash.com/photo-1593784991095-a205069470b6"
},

{
 name:"Sony Alpha Camera",
 brand:"Sony",
 category:"Cameras",
 price:1400,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},

{
 name:"Sony Bluetooth Speaker",
 brand:"Sony",
 category:"Electronics",
 price:120,
 imageUrl:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1"
},

{
 name:"Sony PlayStation Console",
 brand:"Sony",
 category:"Electronics",
 price:500,
 imageUrl:"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3"
},

{
 name:"Sony Wireless Earbuds",
 brand:"Sony",
 category:"Accessories",
 price:180,
 imageUrl:"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1"
},

{
 name:"Sony Sound System",
 brand:"Sony",
 category:"Electronics",
 price:600,
 imageUrl:"https://images.unsplash.com/photo-1545454675-3531b543be5d"
},

{
 name:"Sony Digital Camera Lens",
 brand:"Sony",
 category:"Cameras",
 price:700,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},

{
 name:"Sony Home Theater",
 brand:"Sony",
 category:"Home & Kitchen",
 price:900,
 imageUrl:"https://images.unsplash.com/photo-1545454675-3531b543be5d"
},

{
 name:"Sony Portable Speaker",
 brand:"Sony",
 category:"Electronics",
 price:100,
 imageUrl:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1"
},



/* ================= DELL ================= */


{
 name:"Dell XPS Laptop",
 brand:"Dell",
 category:"Electronics",
 price:1500,
 imageUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
},

{
 name:"Dell Gaming Laptop",
 brand:"Dell",
 category:"Electronics",
 price:1700,
 imageUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
},

{
 name:"Dell Monitor 27 Inch",
 brand:"Dell",
 category:"Electronics",
 price:400,
 imageUrl:"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"
},

{
 name:"Dell Wireless Keyboard",
 brand:"Dell",
 category:"Accessories",
 price:80,
 imageUrl:"https://images.unsplash.com/photo-1587829741301-dc798b83add3"
},

{
 name:"Dell Mouse",
 brand:"Dell",
 category:"Accessories",
 price:40,
 imageUrl:"https://images.unsplash.com/photo-1527814050087-3793815479db"
},

{
 name:"Dell Desktop Computer",
 brand:"Dell",
 category:"Electronics",
 price:1000,
 imageUrl:"https://images.unsplash.com/photo-1593642632823-8f785ba67e45"
},

{
 name:"Dell Laptop Backpack",
 brand:"Dell",
 category:"Accessories",
 price:70,
 imageUrl:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
},

{
 name:"Dell Workstation",
 brand:"Dell",
 category:"Electronics",
 price:2000,
 imageUrl:"https://images.unsplash.com/photo-1593642632823-8f785ba67e45"
},

{
 name:"Dell USB Hub",
 brand:"Dell",
 category:"Accessories",
 price:50,
 imageUrl:"https://images.unsplash.com/photo-1587829741301-dc798b83add3"
},

{
 name:"Dell Business Laptop",
 brand:"Dell",
 category:"Electronics",
 price:1100,
 imageUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
},

/* ================= HP ================= */


{
 name:"HP Spectre Laptop",
 brand:"HP",
 category:"Electronics",
 price:1400,
 imageUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
},

{
 name:"HP Pavilion Laptop",
 brand:"HP",
 category:"Electronics",
 price:850,
 imageUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
},

{
 name:"HP Gaming Laptop",
 brand:"HP",
 category:"Electronics",
 price:1600,
 imageUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
},

{
 name:"HP Desktop Computer",
 brand:"HP",
 category:"Electronics",
 price:900,
 imageUrl:"https://images.unsplash.com/photo-1593642632823-8f785ba67e45"
},

{
 name:"HP Monitor",
 brand:"HP",
 category:"Electronics",
 price:300,
 imageUrl:"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"
},

{
 name:"HP Wireless Keyboard",
 brand:"HP",
 category:"Accessories",
 price:70,
 imageUrl:"https://images.unsplash.com/photo-1587829741301-dc798b83add3"
},

{
 name:"HP Wireless Mouse",
 brand:"HP",
 category:"Accessories",
 price:35,
 imageUrl:"https://images.unsplash.com/photo-1527814050087-3793815479db"
},

{
 name:"HP Printer",
 brand:"HP",
 category:"Electronics",
 price:250,
 imageUrl:"https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6"
},

{
 name:"HP Laptop Bag",
 brand:"HP",
 category:"Accessories",
 price:60,
 imageUrl:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
},

{
 name:"HP Business Laptop",
 brand:"HP",
 category:"Electronics",
 price:1000,
 imageUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
},



/* ================= CANON ================= */


{
 name:"Canon EOS Camera",
 brand:"Canon",
 category:"Cameras",
 price:1200,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},

{
 name:"Canon DSLR Camera",
 brand:"Canon",
 category:"Cameras",
 price:900,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},

{
 name:"Canon Mirrorless Camera",
 brand:"Canon",
 category:"Cameras",
 price:1500,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},

{
 name:"Canon Camera Lens",
 brand:"Canon",
 category:"Cameras",
 price:500,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},

{
 name:"Canon Photo Printer",
 brand:"Canon",
 category:"Electronics",
 price:300,
 imageUrl:"https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6"
},

{
 name:"Canon Compact Camera",
 brand:"Canon",
 category:"Cameras",
 price:600,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},

{
 name:"Canon Professional Lens",
 brand:"Canon",
 category:"Cameras",
 price:1000,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},

{
 name:"Canon Video Camera",
 brand:"Canon",
 category:"Cameras",
 price:1800,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},

{
 name:"Canon Scanner",
 brand:"Canon",
 category:"Electronics",
 price:200,
 imageUrl:"https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6"
},

{
 name:"Canon Camera Tripod",
 brand:"Canon",
 category:"Accessories",
 price:120,
 imageUrl:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
},
/* ================= PUMA ================= */


{
 name:"Puma Running Shoes",
 brand:"Puma",
 category:"Footwear",
 price:120,
 imageUrl:"https://images.unsplash.com/photo-1542291026-7eec264c27ff"
},

{
 name:"Puma Sports T Shirt",
 brand:"Puma",
 category:"Fashion",
 price:40,
 imageUrl:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
},

{
 name:"Puma Training Shoes",
 brand:"Puma",
 category:"Footwear",
 price:130,
 imageUrl:"https://images.unsplash.com/photo-1460353581641-37baddab0fa2"
},

{
 name:"Puma Football Shoes",
 brand:"Puma",
 category:"Sports",
 price:160,
 imageUrl:"https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111"
},

{
 name:"Puma Sports Jacket",
 brand:"Puma",
 category:"Fashion",
 price:90,
 imageUrl:"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3"
},

{
 name:"Puma Gym Bag",
 brand:"Puma",
 category:"Accessories",
 price:60,
 imageUrl:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
},

{
 name:"Puma Sports Cap",
 brand:"Puma",
 category:"Fashion",
 price:30,
 imageUrl:"https://images.unsplash.com/photo-1588850561407-ed78c282e89b"
},

{
 name:"Puma Fitness Watch",
 brand:"Puma",
 category:"Watches",
 price:220,
 imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30"
},

{
 name:"Puma Training Shorts",
 brand:"Puma",
 category:"Fashion",
 price:45,
 imageUrl:"https://images.unsplash.com/photo-1506629905607-d9d1f5f3b8f5"
},

{
 name:"Puma Backpack",
 brand:"Puma",
 category:"Accessories",
 price:70,
 imageUrl:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
},



/* ================= LEVIS ================= */


{
 name:"Levis Classic Jeans",
 brand:"Levis",
 category:"Fashion",
 price:80,
 imageUrl:"https://images.unsplash.com/photo-1542272604-787c3835535d"
},

{
 name:"Levis Denim Jacket",
 brand:"Levis",
 category:"Fashion",
 price:120,
 imageUrl:"https://images.unsplash.com/photo-1551028719-00167b16eac5"
},

{
 name:"Levis Cotton Shirt",
 brand:"Levis",
 category:"Fashion",
 price:60,
 imageUrl:"https://images.unsplash.com/photo-1603252109303-2751441dd157"
},

{
 name:"Levis T Shirt",
 brand:"Levis",
 category:"Fashion",
 price:35,
 imageUrl:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
},

{
 name:"Levis Hoodie",
 brand:"Levis",
 category:"Fashion",
 price:90,
 imageUrl:"https://images.unsplash.com/photo-1556821840-3a63f95609a7"
},

{
 name:"Levis Sneakers",
 brand:"Levis",
 category:"Footwear",
 price:100,
 imageUrl:"https://images.unsplash.com/photo-1542291026-7eec264c27ff"
},

{
 name:"Levis Casual Jacket",
 brand:"Levis",
 category:"Fashion",
 price:150,
 imageUrl:"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3"
},

{
 name:"Levis Cargo Pants",
 brand:"Levis",
 category:"Fashion",
 price:75,
 imageUrl:"https://images.unsplash.com/photo-1506629905607-d9d1f5f3b8f5"
},

{
 name:"Levis Cap",
 brand:"Levis",
 category:"Accessories",
 price:25,
 imageUrl:"https://images.unsplash.com/photo-1588850561407-ed78c282e89b"
},

{
 name:"Levis Backpack",
 brand:"Levis",
 category:"Accessories",
 price:65,
 imageUrl:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
},

];

const seedDB = async () => {

  try {

    console.log(`${'✓'} Seed started`);


    // Create Admin User

    if (!email || !password) {
      throw new Error("Missing admin credentials");
    }


    const existingUser = await User.findOne({ email });


    if (!existingUser) {

      const user = new User({
        email,
        password,
        firstName:"admin",
        lastName:"admin",
        role:ROLES.Admin
      });


      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(
        user.password,
        salt
      );


      await user.save();

      console.log(
        `${'✓'} Admin created`
      );

    }



    // Remove old data

    await Product.deleteMany({});
    await Brand.deleteMany({});
    await Category.deleteMany({});


    console.log(
      `${'!'} Old data removed`
    );



    // Create Categories

    let categoryMap = {};


    for(const cat of categoriesData){

      const category = await Category.create({

        name:cat,

        description:
        `Best ${cat} products`,

        isActive:true

      });


      categoryMap[cat]=category._id;

    }



    console.log(
      `${'✓'} Categories created`
    );



    // Create Brands

    let brandMap = {};


    for(const brandName of brandsData){

      const brand = await Brand.create({

        name:brandName,

        description:
        `${brandName} products`,

        isActive:true

      });


      brandMap[brandName]=brand._id;

    }


    console.log(
      `${'✓'} Brands created`
    );




    // Create Products


    for(let i=0;i<productsData.length;i++){


      const item = productsData[i];


      const product = await Product.create({

        sku:
        `SKU-${Date.now()}-${i}`,


        name:item.name,


        description:
        `Best quality ${item.name}`,


        quantity:
        Math.floor(
          Math.random()*100
        )+1,


        price:item.price,


        imageUrl:item.imageUrl,


        imageKey:
        `${item.name}.jpg`,


        taxable:false,


        isActive:true,


        brand:
        brandMap[item.brand],


        category:
        categoryMap[item.category]

      });



      await Category.updateOne(

        {
          _id:
          categoryMap[item.category]
        },

        {
          $push:{
            products:
            product._id
          }
        }

      );


    }



    console.log(
      `${'✓'} 100 Products created`
    );



    console.log(
      `${'✓'} Database seeded successfully`
    );



  }

  catch(error){

    console.log(
      `${'x'} Seed failed`
    );

    console.log(error);

  }


  finally{

    await mongoose.connection.close();

    console.log(
      `${'✓'} MongoDB connection closed`
    );

  }

};





(async()=>{

 try{

   await setupDB();

   await seedDB();

 }

 catch(error){

   console.log(error.message);

 }

})();
