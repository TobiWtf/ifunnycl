const request = require("request")
let crypto = require("crypto");
const FormData = require("form-data");


let sleep = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));

module.exports = class ifunny {
    constructor(config={}) {
        this.api = config.api || "https://api.ifunny.mobi/v4";
        this.bearer = config.bearer || null;
        this.basic = config.basic || null;
    };

    headers(opts={}) {
        return (
            opts.basic ? {
                Authorization: "Basic " + this.basic,
            } : {
                Authorization: "Bearer " + this.bearer,
            }
        );
    };

    async request(opts={}, callback) {
        opts.uri = this.api + opts.path, delete opts.path;
        request(
            opts,
            async (err, res, body) => {
                if (err) {
                    callback(undefined);
                } else {
                    callback(JSON.parse(body));
                };
            },
        );
    };

    async generate_basic_auth() {
        let hex = crypto.randomBytes(32).toString("hex").toUpperCase();
        let a = hex + "_MsOIJ39Q28:";
        let b = hex + ":MsOIJ39Q28:PTDc3H8a)Vi=UYap";
        let c = crypto.createHash("sha1").update(b).digest("hex");
        let key =  Buffer.from(a + c).toString("base64");
        return key;
    };

    async login(email, password, callback) {
        let basic = await this.generate_basic_auth();
        let headers = {"content-type": "application/x-www-form-urlencoded"};
        headers.Authorization = "Basic " + basic;
        let data = new FormData();
        data.append("grant_type", "password"), data.append("email", email), data.append("password", password);
        let body = {
            grant_type: "password",
            email: email,
            password: password
        };
        this.request(
            {
                path: "/oauth2/token",
                headers: headers,
                form: body,
                method: "POST"
            },
            async response => {
                console.log("Issued request, priming token.".green);
            },
        )
        await sleep(10);
        this.request(
            {
                path: "/oauth2/token",
                headers: headers,
                form: body,
                method: "POST"
            },
            async response => {
                if (!response.access_token) {
                    console.log(`Something went wrong...\n\ntraceback?: ${JSON.stringify(response)}`.red);
                    process.exit(0); 
                } else {
                    let bearer = response.access_token;
                    headers.Authorization = "Bearer " + bearer;
                    console.log(
                        "\n\n\nBEARER TOKEN: ".yellow + bearer.green,
                        "\nBASIC TOKEN: ".yellow + basic.green,
                        "\n\n\nIn the future, there will be more editions to this client."
                    );

                    this.request(
                        {
                            path: "/account",
                            headers: headers,
                            method: "GET"
                        },
                        async response => {
                            let uid = response.data.id;
                            callback(
                                {
                                    bearer: bearer,
                                    basic: basic,
                                    uid: uid
                                }
                            )
                        }
                    )
                }
            },
        );
    };
};