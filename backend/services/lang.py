import httpx
import asyncio
async def get_lang(link):
    print(link)
    async with httpx.AsyncClient() as client:
        response = await client.get(link)
    languages = response.json()

    total = sum(languages.values())
    languages_percentage = [
        {
            "language":lang,
            "percentage":round((count /total)* 100 , 2)
        }
        for lang , count in languages.items()
    ]

    return languages_percentage
    
print(asyncio.run(get_lang("https://api.github.com/repos/prem-programs/Endec/languages")))