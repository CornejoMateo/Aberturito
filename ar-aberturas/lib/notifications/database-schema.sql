-- Tabla de configuración de notificaciones
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enabled BOOLEAN DEFAULT true NOT NULL,
    emails TEXT[] DEFAULT '{}' NOT NULL,
    time TEXT DEFAULT '09:00' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de filtros de eventos
CREATE TABLE IF NOT EXISTS event_filters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings_id UUID REFERENCES notification_settings(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('type', 'title')),
    value TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de notificaciones de email enviadas
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings_id UUID REFERENCES notification_settings(id) ON DELETE CASCADE NOT NULL,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_notification_settings_enabled ON notification_settings(enabled);
CREATE INDEX IF NOT EXISTS idx_event_filters_settings_id ON event_filters(settings_id);
CREATE INDEX IF NOT EXISTS idx_event_filters_enabled ON event_filters(enabled);
CREATE INDEX IF NOT EXISTS idx_email_notifications_settings_id ON email_notifications(settings_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_event_id ON email_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON email_notifications(sent_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_settings_updated_at 
    BEFORE UPDATE ON notification_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (ajustar según necesidades)
CREATE POLICY "Enable all operations on notification_settings" ON notification_settings
    FOR ALL USING (true);

CREATE POLICY "Enable all operations on event_filters" ON event_filters
    FOR ALL USING (true);

CREATE POLICY "Enable all operations on email_notifications" ON email_notifications
    FOR ALL USING (true);
