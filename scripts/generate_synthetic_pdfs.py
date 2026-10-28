"""
Generates lawful, synthetic test PDFs matching Property Alpha and Beta.
Uses standard text writing or reportlab if installed.
"""
import os

def create_synthetic_corpus():
    out_dir = os.path.join(os.path.dirname(__file__), "..", "corpus")
    os.makedirs(out_dir, exist_ok=True)

    alpha_report = os.path.join(out_dir, "Property_Alpha_Structural_Report.txt")
    with open(alpha_report, "w") as f:
        f.write("""STRUCTURAL ENGINEERING LOAD CAPACITY REPORT
Property: Inland Empire Logistics Center IV (Ontario, CA)
Verified Slab Rating: 650 psf
Surveyed Clear Height: 40.0 feet measured from finished slab to bottom of steel truss.
Signed: California Licensed Structural Engineer PE #88492
""")

    beta_report = os.path.join(out_dir, "Property_Beta_Utility_Agreement.txt")
    with open(beta_report, "w") as f:
        f.write("""UTILITY SERVICE INTERCONNECTION AGREEMENT
Account: 940-209-112 (Columbus Cold Hub)
Substation Capacity: Energized service allocation is limited to 500 kVA.
Broker flyer claim of 2,500 kVA is an unapproved future request.
""")

    print(f"Synthetic corpus written to {out_dir}")

if __name__ == "__main__":
    create_synthetic_corpus()
