import re

def analyse_repo(text):

    # if the readme contains emoji characters, skip processing
    emoji_pattern = re.compile(
        (
            "["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags
            u"\U00002702-\U000027B0"  # dingbats
            u"\U000024C2-\U0001F251"
            "]+"
        ),
        flags=re.UNICODE,
    )

    if emoji_pattern.search(text):
        text = emoji_pattern.sub(" ", text)

    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"!\[[^\]]*\]\([^\)]+\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"(?m)^\s{0,3}>\s?", "", text)
    text = re.sub(r"(?m)^\s{0,3}#{1,6}\s*", "", text)
    text = re.sub(r"(?m)^[*\-+]\s+", "", text)
    text = re.sub(r"(?m)^\d+\.\s+", "", text)
    text = re.sub(r"\*\*|__|\*|_|~~", "", text)
    text = re.sub(r"---", "", text)
    text = re.sub(r"/","",text)
    text = re.sub(r"[()]","",text)

    return " ".join(text.split())
       