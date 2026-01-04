import os
import sys
import pdfplumber

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file using pdfplumber."""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except Exception as e:
        return f"ERROR extracting {pdf_path}: {str(e)}\n"

def main():
    plan_dir = "plan"
    if not os.path.exists(plan_dir):
        print(f"ERROR: Directory '{plan_dir}' not found")
        sys.exit(1)
    
    pdf_files = sorted([f for f in os.listdir(plan_dir) if f.endswith('.pdf')])
    
    if not pdf_files:
        print(f"No PDF files found in '{plan_dir}'")
        sys.exit(1)
    
    output_file = "plan_summary_clean.txt"
    with open(output_file, 'w', encoding='utf-8') as out:
        for pdf_file in pdf_files:
            pdf_path = os.path.join(plan_dir, pdf_file)
            print(f"Extracting text from {pdf_file}...")
            out.write(f"\n{'='*80}\n")
            out.write(f"FILE: {pdf_file}\n")
            out.write(f"{'='*80}\n\n")
            text = extract_text_from_pdf(pdf_path)
            out.write(text)
            out.write("\n\n")
    
    print(f"\nExtraction complete! Text saved to {output_file}")

if __name__ == "__main__":
    main()