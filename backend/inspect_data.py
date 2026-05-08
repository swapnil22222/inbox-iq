import pandas as pd

# Load dataset
df = pd.read_csv("customer_support_emails.csv")

print("===== DATASET SHAPE =====")
print(df.shape)

print("\n===== COLUMN NAMES =====")
print(df.columns.tolist())

print("\n===== CATEGORY COUNTS =====")
print(df["category"].value_counts())

print("\n===== UNIQUE CATEGORY COUNT =====")
print(df["category"].nunique())