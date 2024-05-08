# Open the input file
with open('/home/tfritzy/dev/LightspeedTyperacing/src/data/lists/words.txt', 'r') as input_file:
    # Read each word from the input file and store them in a list
    words = [word.strip() for word in input_file]

# Sort the words by length in descending order and take the first 100
longest_words = sorted(words, key=len, reverse=True)[:100]

# Open the output file
with open('/home/tfritzy/dev/LightspeedTyperacing/src/data/lists/LongestWords.txt', 'w') as output_file:
    # Write the longest words to the output file
    for word in longest_words:
        output_file.write(word + '\n')