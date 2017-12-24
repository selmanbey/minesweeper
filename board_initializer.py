def board_initializer():
    for row in range(1, 16):
        print("<tr>")
        if row < 10:
            for cell in range(1, 16):
                if cell < 10:
                    print(f"    <td id=\"0{row}0{cell}\"></td>")
                else:   
                    print(f"    <td id=\"0{row}{cell}\"></td>")
        else:
            for cell in range(1, 16):
                if cell < 10:
                    print(f"    <td id=\"{row}0{cell}\"></td>")
                else:    
                    print(f"    <td id=\"{row}{cell}\"></td>")
        print("</tr>")

def hasMine_initializer():
     for row in range(1, 16):
        if row < 10:
            for cell in range(1, 16):
                if cell < 10:
                    print(f"\"0{row}0{cell}\": false,")
                else:   
                    print(f"\"0{row}{cell}\": false,")
        else:
            for cell in range(1, 16):
                if cell < 10:
                    print(f"\"{row}0{cell}\": false,")
                else:    
                    print(f"\"{row}{cell}\": false,")

hasMine_initializer()



