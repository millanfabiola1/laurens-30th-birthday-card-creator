from PIL import Image, ImageDraw
import os

# Create a pink gradient thumbnail (1200x630 for Open Graph)
width, height = 1200, 630
img = Image.new('RGB', (width, height), color='#ffb6d9')

# Create gradient from light pink to hot pink
draw = ImageDraw.Draw(img)
for y in range(height):
    # Gradient from #ffb6d9 (top) to #ff1493 (bottom)
    ratio = y / height
    r = int(255 * (1 - ratio * 0.3))
    g = int(182 * (1 - ratio * 0.5))
    b = int(217 * (1 - ratio * 0.4))
    color = (r, g, b)
    draw.line([(0, y), (width, y)], fill=color)

# Add decorative text
try:
    # Try to use a default font
    from PIL import ImageFont
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 72)
        font_small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 48)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Center text
    text1 = "Lauren's 30th"
    text2 = "Birthday Card Creator"
    
    # Get text bounding boxes
    bbox1 = draw.textbbox((0, 0), text1, font=font_large)
    bbox2 = draw.textbbox((0, 0), text2, font=font_small)
    text1_width = bbox1[2] - bbox1[0]
    text2_width = bbox2[2] - bbox2[0]
    text1_height = bbox1[3] - bbox1[1]
    text2_height = bbox2[3] - bbox2[1]
    
    # Draw text with shadow for visibility
    x1 = (width - text1_width) // 2
    y1 = height // 2 - text1_height - 10
    x2 = (width - text2_width) // 2
    y2 = height // 2 + 10
    
    # Draw shadow
    draw.text((x1 + 3, y1 + 3), text1, fill='#c71585', font=font_large)
    draw.text((x2 + 3, y2 + 3), text2, fill='#c71585', font=font_small)
    
    # Draw main text
    draw.text((x1, y1), text1, fill='#ffffff', font=font_large)
    draw.text((x2, y2), text2, fill='#ffffff', font=font_small)
except Exception as e:
    print(f"Could not add text: {e}")

# Save to public folder
output_path = os.path.join(os.path.dirname(__file__), 'public', 'thumbnail2.png')
img.save(output_path)
print(f'Created pink thumbnail at {output_path}')

