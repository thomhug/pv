#!/var/www/.python-env-pymodbus/bin/python
# python 3.9
# pymodbus 2.5.3

from pymodbus.client.sync import ModbusTcpClient as ModbusClient
from pymodbus.payload import BinaryPayloadDecoder
from pymodbus.constants import Endian
from pymodbus.compat import iteritems
import binascii
import socket
import logging
import pdb
import time
import socket

hostname = socket.gethostname()
prefix = "meter{location=\"" + hostname + "\",description=\"ktl17\",position=\""
prefix2 = "meter{location=\"" + hostname + "\",device=\"ktl17\",position=\""
prefix_sensor = "sensor{location=\"" + hostname + "\",position=\""
ip_inverter="192.168.178.63"
client = ModbusClient(ip_inverter, port=502)

def extract_list(input_list, start, num):
    extracted_elements = []
    # Überprüfe, ob start_bit innerhalb der Liste liegt
    if start >= len(input_list):
        return extracted_elements

    # Extrahiere die Elemente ab start_bit
    for i in range(start, min(start + num, len(input_list))):
        extracted_elements.append(input_list[i])

    return extracted_elements


client.connect()
if client.connect():
    time.sleep(1)

    # 32'000
    try:
      request_large = client.read_holding_registers(address=32000,count=116, unit=1)
    except Exception as e:
      print("# error calling 32000: " + str(e))
    else:
     if hasattr(request_large, 'registers') and len(request_large.registers)==116:

      request_list = extract_list(request_large.registers, 80, 2)
      generator = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_32bit_int()
      print ("# active power: " + str(generator/1000) + " kW")
      #print(prefix + "generator\",type=\"gauge\"} " + str(generator))

      request_list = extract_list(request_large.registers, 16, 1)
      pv1_v = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_16bit_int()/10

      request_list = extract_list(request_large.registers, 17, 1)
      pv1_a = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_16bit_int()/100

      request_list = extract_list(request_large.registers, 18, 1)
      pv2_v = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_16bit_int()/10

      request_list = extract_list(request_large.registers, 19, 1)
      pv2_a = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_16bit_int()/100

      request_list = extract_list(request_large.registers, 20, 1)
      pv3_v = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_16bit_int()/10

      request_list = extract_list(request_large.registers, 21, 1)
      pv3_a = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_16bit_int()/100

      request_list = extract_list(request_large.registers, 22, 1)
      pv4_v = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_16bit_int()/10

      request_list = extract_list(request_large.registers, 23, 1)
      pv4_a = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_16bit_int()/100

      pv1_w = round(pv1_v*pv1_a,2)
      print("# pv1: " + str(pv1_w) + " W")
      print(prefix2 + "string\",type=\"gauge\",description=\"pv1\"} " + str(pv1_w))

      pv2_w = round(pv2_v*pv2_a,2)
      print("# pv2: " + str(pv2_w) + " W")
      print(prefix2 + "string\",type=\"gauge\",description=\"pv2\"} " + str(pv2_w))

      pv3_w = round(pv3_v*pv3_a,2)
      print("# pv3: " + str(pv3_w) + " W")
      print(prefix2 + "string\",type=\"gauge\",description=\"pv3\"} " + str(pv3_w))

      pv4_w = round(pv4_v*pv4_a,2)
      print("# pv4: " + str(pv4_w) + " W")
      print(prefix2 + "string\",type=\"gauge\",description=\"pv4\"} " + str(pv4_w))


      print("# dc total: " + str(round(pv1_w + pv2_w + pv3_w + pv4_w,2)) + " W")
      print("# ")
      
      request_list = extract_list(request_large.registers, 87, 1)
      temp = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_16bit_int()
      print("# temp: " + str(temp/10) + " C")
      print(prefix_sensor + "generator\",kind=\"generator\",type=\"temp\"} " + str(temp/10))
 
      request_list = extract_list(request_large.registers, 106, 2)
      generator_counter = BinaryPayloadDecoder.fromRegisters(request_list, Endian.Big).decode_32bit_uint()
      print("# total: " + str(generator_counter/100) + " kWh")
      #print(prefix + "generator\",type=\"counter\"} " + str(generator_counter*10))

      
      # no battery
      print(prefix + "battery\",type=\"gauge\"} 0")
   
