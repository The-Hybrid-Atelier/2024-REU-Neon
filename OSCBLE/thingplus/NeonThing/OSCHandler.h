// OSCHandler.h
#ifndef OSCHANDLER_H
#define OSCHANDLER_H

#include <OSCMessage.h>

void sendSimpleOSC(const char* address);
void sendSampleOSC(const char* address, int value);
void sendOSC(const char *address, const int *args, int numArgs);
extern void routeOSC(OSCMessage &msg);

#endif // OSCHANDLER_H
