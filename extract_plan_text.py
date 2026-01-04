import os
import sys

try:
    import PyPDF2
    PDF_LIB = "PyPDF2"
except ImportError:
    try:
        import pypdf
        PDF_LIB = "pypdf"
    except ImportError:
        print("ERROR: Neither PyPDF2 nor pypdf is installed.")
        print("Please install one: pip install PyPDF2 or pip install pypdf")
        sys.exit(1)

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    try:
        with open(pdf_path, 'rb') as file:
            if PDF_LIB == "PyPDF2":
                # Try new API first
                try:
                    reader = PyPDF2.PdfReader(file)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                except AttributeError:
                    # Fall back to old API
                    reader = PyPDF2.PdfFileReader(file)
                    text = ""
                    for page_num in range(reader.numPages):
                        page = reader.getPage(page_num)
                        text += page.extractText() + "\n"
            else:  # pypdf
                reader = pypdf.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
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
    
    output_file = "plan_summary.txt"
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

