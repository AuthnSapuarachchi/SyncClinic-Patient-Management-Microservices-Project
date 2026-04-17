package com.healthcare.notification.service;

import com.healthcare.notification.config.TwilioConfig;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

	@Autowired
	private TwilioConfig twilioConfig;

	public void sendSms(String toPhoneNumber, String messageBody) {
		try {
			log.info("Sending SMS to: {}", toPhoneNumber);
			Message message = Message.creator(
					new PhoneNumber(toPhoneNumber),
					new PhoneNumber(twilioConfig.getTwilioPhoneNumber()),
					messageBody
			).create();
			log.info("SMS sent successfully to: {} with SID: {}", toPhoneNumber, message.getSid());
		} catch (Exception e) {
			log.error("Failed to send SMS to: {}", toPhoneNumber, e);
			throw new RuntimeException("Failed to send SMS", e);
		}
	}

}
