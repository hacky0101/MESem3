export default function handler(req, res) {
    console.log("MESem3 API HIT");
    console.log("METHOD:", req.method);
    console.log("BODY:", req.body);

    return res.status(200).json({
        success: true,
        message: "MESem3 API is working!"
    });
}
