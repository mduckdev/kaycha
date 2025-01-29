import { otomotoDataI } from "../../interfaces/data";
import { Request, Response } from 'express';
import axios from "axios";
import { promises as fs } from 'fs';
import { ListingsResponseI } from "../../interfaces/responses";
import { randomProperty } from "../../utils";
import { AppDataSource } from "../../data-source";
import { Listing } from "../../entity/Listing";
import { ListingsPreferences } from "../../entity/ListingsPreferences";
const otomotoData: otomotoDataI = {
    url: "https://www.otomoto.pl/api/open",
    access_token: null,
    expires: 0
}


export const getListingsController = async (req: Request, res: Response): Promise<Response> => {
    
    const listingsPreferencesRepository = (await AppDataSource).getRepository(ListingsPreferences);
    const preferences = await listingsPreferencesRepository.findOne({where:{id:1}});
    const response: ListingsResponseI[] = [];
    if(preferences?.showDashboard){
        const listingRepository = (await AppDataSource).getRepository(Listing);
        const listings = await listingRepository.find();
        const mapped:ListingsResponseI[] = listings.map(listing => listing.toResponseObject());
        response.push(...mapped)
    }
    
    if ((!otomotoData.access_token || otomotoData.expires < Date.now()) && (preferences?.showOtomoto)) {
        console.log("Authenticating to otomoto API...")
        const url = otomotoData.url + "/oauth/token";

        const body = new URLSearchParams({
            client_id: process.env.OTOMOTO_CLIENT_ID || "",
            client_secret: process.env.OTOMOTO_CLIENT_SECRET || "",
            grant_type: "password",
            username: process.env.OTOMOTO_USERNAME || "",
            password: process.env.OTOMOTO_PASSWORD || ""
        }).toString();

        const response = await axios.post(url, body).catch(err => { console.error(err.response?.data) });
        if (response?.data?.access_token && response?.data?.expires_in) {
            console.log("Successfully authenticated to otomoto API")
            otomotoData.access_token = response.data.access_token;
            otomotoData.expires = Date.now() + (response.data.expires_in * 1000);
        } else {
            return res.json(response);
        }
    }
    if(preferences?.showOtomoto){
        const url = otomotoData.url + "/account/adverts";
        const config = {
            headers: {
                Authorization: `Bearer ${otomotoData.access_token}`,
                "User-Agent": process.env.OTOMOTO_USERNAME,
                "Content-Type": "application/json"
            }
        }
        const advertsList = await axios.get(url, config);
        if (advertsList.data.results.length == 0) {
            console.log("No active listings, sending the placeholder");
            return res.json(response);
        }
    
        await advertsList.data.results.forEach(async (auction: any) => {
            if (auction.status != "active") {
                return;
            }
            const url = otomotoData.url + `/account/adverts/${auction.id}`;
            const auctionData = await axios.get(url, config);
            const temp: ListingsResponseI = {
                title: auctionData.data.title,
                href: auctionData.data.url,
                price: auctionData.data.params.price["1"],
                year: 0,
                imgSrc: auctionData.data.photos["1"][randomProperty(auctionData.data.photos["1"])]
            }
    
            response.push(temp);
        });
    }
    

    return res.json(response);
}