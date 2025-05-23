//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//@EnableWebSocketMessageBroker
//public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {
//    @Override
//    public void configureMessageBroker(MessageBrokerRegistry config) {
//        config.enableSimpleBroker("/topic");  // This is where messages are sent
//        config.setApplicationDestinationPrefixes("/app");  // Prefix for client messages
//    }
//
//    @Override
//    public void registerStompEndpoints(StompEndpointRegistry registry) {
//        registry.addEndpoint("/ws").withSockJS();  // WebSocket endpoint
//    }
//}
