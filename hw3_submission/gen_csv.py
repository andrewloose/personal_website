import pandas as pd

# load data
df = pd.read_csv("socialMedia.csv")
print(df.head())

# ensure likes is numeric
df["Likes"] = pd.to_numeric(df["Likes"], errors="coerce")

# Check if there are NaN values in 'Likes' column after conversion
print("\nData after converting 'Likes' to numeric:")
print(df[['Likes']].head())
print(f"Number of NaN values in 'Likes': {df['Likes'].isna().sum()}")

# concert to datetime
df["Date"] = df["Date"].str.replace(r"\s\([A-Za-z]+\)", "", regex=True)
# to datafrome
df["Date"] = pd.to_datetime(df["Date"], format='%m/%d/%Y', errors="coerce")
print(df["Date"].head(20))
print(df[['Date']].head())
print(f"numb of nan vals: {df['Date'].isna().sum()}")
#Drop rows where 'Likes' or 'Date' is Nan
df.dropna(subset=["Likes", "Date"], inplace=True)
print("\n cleaned ddata:")
print(df.head())

# groupby platform posttype
df_avg = df.groupby(["Platform", "PostType"])["Likes"].mean().reset_index()
print(df_avg.head())

# round avg
df_avg["AvgLikes"] = df_avg["Likes"].round(2)
# drop likes
df_avg = df_avg.drop(columns=["Likes"])
print("\navglikes df:")
print(df_avg.head())
df_avg.to_csv("SocialMediaAvg.csv", index=False)

# format date
df["FormattedDate"] = df["Date"].dt.strftime("%-m/%-d/%Y")  # removes weekday
df_time = df.groupby("FormattedDate")["Likes"].mean().reset_index()
print("\nAverage Likes by Date:")
print(df_time.head())
df_time.rename(columns={"FormattedDate": "Date", "Likes": "AvgLikes"}, inplace=True)
df_time.to_csv("SocialMediaTime.csv", index=False)