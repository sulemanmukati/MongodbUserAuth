import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import bcrypt from "bcryptjs"
import userModels from './models/UserSchema.js'
import cors from "cors"


const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))

const PORT = process.env.PORT || 5000
const DBURI = process.env.MONGODB_URI

mongoose.connect(DBURI);

mongoose.connection.on("connected", () => console.log("MongoDB Connected"));

mongoose.connection.on("error", (err) => console.log("MongoDB Error", err));


app.get("/",(request,response)=>{
    response.send("server Runnig successfully");
})


app.post("/api/signup", async (req,res)=>{
    const{firstName,lastName,email,password} = req.body
    if (!firstName||!lastName|| !email||!password){
        res.json({
            message:"requried fuilds are missing",
            status:false,
        })
        return
    }

    const emailexiste = await userModels.findOne({email})
    if(emailexiste !== null){
        res.json({
            message:'invailed email',
            status:false
        })
        return
    }

    const hashPassword = await bcrypt.hash(password,10)
    console.log ("hashPassword",hashPassword)

    let userObj = {
        firstName,
        lastName,
        email,
        password:hashPassword,
    }
    const createUser = await userModels.create(userObj)
    res.json({
        message:'user create succesfully..',
        status :true
    })
    // console.log(body)
    res.send("signup api")
})
// app.post("/api/signup", async (req, res) => {
//     const { firstName, lastName, email, password } = req.body;

//     console.log("Received signup request:", req.body);

//     if (!firstName || !lastName || !email || !password) {
//         return res.json({
//             message: "Required fields are missing",
//             status: false,
//         });
//     }

//     try {
//         const emailExists = await userModels.findOne({ email });
//         console.log("Email check result:", emailExists);

//         if (emailExists !== null) {
//             return res.json({
//                 message: 'Invalid email',
//                 status: false
//             });
//         }

//         const hashPassword = await bcrypt.hash(password, 10);
//         console.log("Hashed password:", hashPassword);

//         const userObj = {
//             firstName,
//             lastName,
//             email,
//             password: hashPassword,
//         };

//         const createUser = await userModels.create(userObj);
//         console.log("User created:", createUser);

//         res.json({
//             message: 'User created successfully',
//             status: true
//         });
//     } catch (error) {
//         console.error("Error during signup:", error);
//         res.status(500).json({
//             message: "Internal server error",
//             status: false
//         });
//     }
// });



app.post("/login", async (req,res)=>{
    const {email, password} = req.body;
    console.log( email, password);

    if(!email || !password){
        res.json({
            message:"required field is missing",
            status:false
        })
        return;
    }

    const loginemailExist = await userModels.findOne({email})

    if(!loginemailExist){
        res.json({
            message:"Invalid Email & Password",
            status:false
        })
        return;
    };

    const comparePassword = await bcrypt.compare(password, loginemailExist.password);

    if (!comparePassword){
        res.json({
            message:"Invalid Email & Password",
            status:false
        });
        return;
    }
    res.json({
        message:"Login Successfully",
        status:true
    })


})

app.listen(PORT,()=>{

    console.log("backend start ......")
})