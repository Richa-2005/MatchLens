from skills import SECTIONS
import re


def isHeading(line):
    line = line.strip()
    
    if len(line) == 0 or len(line) > 50:
        return False
    
    if line[-1] in ['.', '?', '!']:
        return False
        
    is_caps = line.isupper()
    is_numeric_header = re.match(r'^\d+(\.\d+)*\s', line)
    
    return is_caps or is_numeric_header or line.istitle()

def parse_sections(resume_text):
    lines = resume_text.split('\n')

    parsed_sections = {
        "skills": [],
        "projects": [],
        "education": [],
        "experience": [],
        "other": []
    }

    current_section = "other"

    for line in lines:
        line = line.strip()
        if not line:
            continue

        matched_section = None

        for section in SECTIONS:
            for heading in SECTIONS[section]:
                lower_line = line.lower()

                if lower_line == heading:
                    matched_section = section
                    remaining_text = ""
                    break

                if lower_line.startswith(heading + ":"):
                    matched_section = section
                    remaining_text = line[len(heading) + 1:].strip()
                    break

            if matched_section:
                break

        if matched_section:
            current_section = matched_section

            if remaining_text:
                parsed_sections[current_section].append(remaining_text)

        elif isHeading(line):
            current_section = "other"

        else:
            parsed_sections[current_section].append(line)

    return parsed_sections

    
def normalize_punctuations(text):
    punctuations = ",;:!?{()[]}"
    translator = str.maketrans('','',punctuations) #remove specific punctuations.
    text = text.translate(translator)
    text = re.sub(r'\s+', ' ', text).strip() #remove multiple whitespaces

    return text 

def stop_words(text):
    stop = {'the','and','is','or','are','am','must','should','for','of','in','to','a','an','has'}
    ans = []
    for word in text:
        if (word not in stop) and (len(word) >=3):
            ans.append(word)
    
    return ans

def tokenize_text(text):
    #lowercase the text
    text = text.lower()
    
    #normalize punctutations in the text specifically
    text = normalize_punctuations(text)
    
    #word list 
    text = text.split()
    #remove stop words
    text = stop_words(text)

    return text
