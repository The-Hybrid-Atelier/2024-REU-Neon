"""
Author: Joel Beauregard

vtt_file_filter_merge_files.py

This script uses both the MadL_bendCap.vtt and MadL_bendMeta.vtt files writes them into one vtt file with the captions first

Function:
-----------
1. merge_vtt_files(capVtt_file, metaVtt_file, merged_vtt_file):
    - Merges the contents of two VTT files into a single VTT file.
    Parameters:
    -----------
    - capVtt_file: str
        The path to the caption VTT file.
    - metaVtt_file: str
        The path to the metadata VTT file.
    - merged_vtt_file: str
        The path to the merged output VTT file.

Function Workflow:
------------------
1. The script reads the contents of the caption VTT file and writes them to the merged VTT file.
2. It then reads the contents of the metadata VTT file, excluding the header; as the the header from the caption file is the same,
   and appends them to the merged VTT file.

Notes:
------
- The merged VTT file will contain the captions followed by the metadata.
- It is assumed that the input VTT files are in the correct format and order.

"""

# Function to merge the contents of two VTT files into a single VTT file
def merge_vtt_files(capVtt_file, metaVtt_file, merged_vtt_file):

    # Open the merged VTT file for writing
    with open(merged_vtt_file, "w") as mergedVttFile, open(
        capVtt_file, "r"
    ) as capVttFile, open(metaVtt_file, "r") as metaVttFile:
        # Open and read the caption VTT file and write its contents to the merged VTT file
        cap_data = capVttFile.read()
        mergedVttFile.write(cap_data)
        # Open and read the metadata VTT file, excluding the header, and append its contents to the merged VTT file
        meta_data_after_header = metaVttFile.readlines()[4:]
        mergedVttFile.write("".join(meta_data_after_header))


# Cap vtt file location/path
capVtt_file = "MadL_bendCap.vtt"

# meta vtt file location/path
metaVtt_file = "MadL_bendMeta.vtt"

# Merged vtt output file location
mergedVtt_output_file = "MadL_BendMerged.vtt"

merge_vtt_files(capVtt_file, metaVtt_file, mergedVtt_output_file)
