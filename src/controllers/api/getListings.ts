import { otomotoDataI } from "../../interfaces/data";
import { Request, Response } from 'express';

import axios from "axios";
import { ListingsResponseI } from "../../interfaces/responses";
import { randomProperty } from "../../utils";
const otomotoData: otomotoDataI = {
    url: "https://www.otomoto.pl/api/open",
    access_token: null,
    expires: 0
}

export const getListingsController = async (req: Request, res: Response): Promise<Response> => {
    const placeholder = [
        {
            title: "Koparka kramer",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6IjE4MmN5eDFhczlmbS1PVE9NT1RPUEwiLCJ3IjpbeyJmbiI6IndnNGducXA2eTFmLU9UT01PVE9QTCIsInMiOiIxNiIsInAiOiIxMCwtMTAiLCJhIjoiMCJ9XX0.19droFAdqgM2_n3zCCBPAHiRE3lJojTYTTVxlykXVxw/image;s=0x450;q=70",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1990,
            price: 42900,

        },
        {
            title: "Koparka kramer 2",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6Inl6ZGw3NmdoNXMzNDMtT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19.DsHTE5tqA9QjSP5AoNIZNu9Jx56dKOTY4XBgJbCtr2A/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1990,
            price: 42900,

        },
        {
            title: "Koparka kramer 3",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6ImptNDVxeWxmeTl1cDItT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19._vkCo0kIxGV74s5krqV-PiTzw-fZ40nWuifg15Zv7BA/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1989,
            price: 42900,

        },
        {
            title: "Koparka kramer 4",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6ImptNDVxeWxmeTl1cDItT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19._vkCo0kIxGV74s5krqV-PiTzw-fZ40nWuifg15Zv7BA/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1989,
            price: 42900,

        },
        {
            title: "Koparka kramer 5",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6ImptNDVxeWxmeTl1cDItT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19._vkCo0kIxGV74s5krqV-PiTzw-fZ40nWuifg15Zv7BA/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1989,
            price: 42900,

        },
        {
            title: "Koparka kramer 6",
            imgSrc: "https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6ImptNDVxeWxmeTl1cDItT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJwIjoiMTAsLTEwIiwiYSI6IjAifV19._vkCo0kIxGV74s5krqV-PiTzw-fZ40nWuifg15Zv7BA/image;s=1920x0",
            href: "https://www.otomoto.pl/maszyny-budowlane/oferta/kramer-potratz-kl1500-widlak-widlowy-wozek-terenowy-tur-rak-ladowacz-zettelmeyer-jcb-ursus-atlas-ok-weidemann-schaffer-zetor-volvo-film-z-pracy-kolowa-przegubowa-ladowarka-nowa-pompa-jazdy-ID6GcrQQ.html",
            year: 1989,
            price: 42900,

        },
    ];

    if (!otomotoData.access_token || otomotoData.expires < Date.now()) {
        const url = otomotoData.url + "/oauth/token";

        const body = new URLSearchParams({
            client_id: process.env.OTOMOTO_CLIENT_ID || "",
            client_secret: process.env.OTOMOTO_CLIENT_SECRET || "",
            grant_type: "password",
            username: process.env.OTOMOTO_USERNAME || "",
            password: process.env.OTOMOTO_PASSWORD || ""
        }).toString();

        const response = await axios.post(url, body).catch(err => { console.error(err.data) });
        if (response?.data?.access_token && response?.data?.expires_in) {
            otomotoData.access_token = response.data.access_token;
            otomotoData.expires = Date.now() + (response.data.expires_in * 1000);
        } else {
            return res.json(placeholder);
        }
    }
    const url = otomotoData.url + "/account/adverts";
    const config = {
        headers: {
            Authorization: `Bearer ${otomotoData.access_token}`,
            "User-Agent": process.env.USERNAME,
            "Content-Type": "application/json"
        }
    }
    const advertsList = await axios.get(url, config);
    if (advertsList.data.results.length == 0) {
        return res.json(placeholder);
    }

    const response: ListingsResponseI[] = [];
    await advertsList.data.results.forEach(async (auction: any) => {
        if (auction.status != "active") {
            return;
        }
        const url = otomotoData.url + `/account/adverts/${auction.id}`;
        const auctionData = await axios.get(url, config);
        const temp = {
            title: auctionData.data.title,
            href: auctionData.data.url,
            price: auctionData.data.params.price["1"],
            year: 0,
            src: auctionData.data.photos["1"][randomProperty(auctionData.data.photos["1"])]
        }

        response.push(temp);
    });

    return res.json(response);
}