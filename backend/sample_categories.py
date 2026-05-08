import pandas as pd

df = pd.read_csv("customer_support_emails.csv")

categories = df["category"].unique()

for cat in categories:
    print("\n==============================")
    print("CATEGORY:", cat)
    print("==============================")

    samples = df[df["category"] == cat]["body"].head(5)

    for i, text in enumerate(samples, start=1):
        print(f"{i}. {text}")