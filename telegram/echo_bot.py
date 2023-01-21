#!/usr/bin/python3
import telebot

API_TOKEN = '<TOKEN>'
bot = telebot.TeleBot(API_TOKEN)

print ("\nBot started...\n")

@bot.message_handler(func=lambda message: True)
def echo_message(message):
    print ("Id: " + str(message.chat.id) + " - " + message.text)

try:
  bot.polling()
except Exception as err:
  print("Read timeout")
