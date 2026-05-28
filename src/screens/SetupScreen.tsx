import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { colors, radius, spacing } from '../theme';
import {
  MAX_OFFICES,
  OfficeLocation,
  newOfficeId,
  removeOffice,
  upsertOffice,
} from '../storage';

type Props = {
  offices: OfficeLocation[];
  onDone: () => Promise<void>;
  onClose: () => void;
};

type Editing =
  | { mode: 'list' }
  | { mode: 'edit'; office: OfficeLocation }
  | { mode: 'new' };

export function SetupScreen({ offices, onDone, onClose }: Props) {
  const [state, setState] = useState<Editing>({ mode: 'list' });

  if (state.mode === 'list') {
    return (
      <ListView
        offices={offices}
        onAdd={() => setState({ mode: 'new' })}
        onEdit={(o) => setState({ mode: 'edit', office: o })}
        onRemove={async (o) => {
          await removeOffice(o.id);
          await onDone();
        }}
        onClose={onClose}
      />
    );
  }

  const editing: OfficeLocation =
    state.mode === 'edit'
      ? state.office
      : {
          id: newOfficeId(),
          name: '',
          latitude: 0,
          longitude: 0,
          radiusMeters: 120,
        };

  return (
    <EditView
      initial={editing}
      isNew={state.mode === 'new'}
      onSave={async (o) => {
        await upsertOffice(o);
        await onDone();
        setState({ mode: 'list' });
      }}
      onBack={() => setState({ mode: 'list' })}
    />
  );
}

function ListView({
  offices,
  onAdd,
  onEdit,
  onRemove,
  onClose,
}: {
  offices: OfficeLocation[];
  onAdd: () => void;
  onEdit: (o: OfficeLocation) => void;
  onRemove: (o: OfficeLocation) => Promise<void>;
  onClose: () => void;
}) {
  const confirmRemove = (o: OfficeLocation) => {
    Alert.alert(
      'Remover escritório?',
      `"${o.name}" será apagado. Check-ins já registrados continuam no histórico.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => onRemove(o) },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Seus escritórios</Text>
        <Text style={styles.subtitle}>
          Cadastre até {MAX_OFFICES} locais. Cada vez que você entrar no raio de um deles,
          o dia será contabilizado.
        </Text>

        {offices.length === 0 ? (
          <Card>
            <Text style={styles.empty}>
              Nenhum escritório cadastrado ainda. Toque em "Adicionar local" para começar.
            </Text>
          </Card>
        ) : (
          offices.map((o) => (
            <Pressable key={o.id} onPress={() => onEdit(o)}>
              <Card style={styles.officeCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.officeName}>{o.name || 'Sem nome'}</Text>
                  <Text style={styles.officeMeta}>
                    {o.latitude.toFixed(4)}, {o.longitude.toFixed(4)} · raio de{' '}
                    {o.radiusMeters} m
                  </Text>
                </View>
                <Pressable
                  onPress={() => confirmRemove(o)}
                  hitSlop={8}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeText}>Remover</Text>
                </Pressable>
              </Card>
            </Pressable>
          ))
        )}

        <View style={{ height: spacing(2) }} />
        <Button
          title={
            offices.length >= MAX_OFFICES
              ? `Limite de ${MAX_OFFICES} locais atingido`
              : 'Adicionar local'
          }
          onPress={onAdd}
          disabled={offices.length >= MAX_OFFICES}
        />
        <View style={{ height: spacing(1) }} />
        <Button title="Fechar" variant="ghost" onPress={onClose} />
      </ScrollView>
    </View>
  );
}

function EditView({
  initial,
  isNew,
  onSave,
  onBack,
}: {
  initial: OfficeLocation;
  isNew: boolean;
  onSave: (o: OfficeLocation) => Promise<void>;
  onBack: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [radiusStr, setRadiusStr] = useState(String(initial.radiusMeters));
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    initial.latitude || initial.longitude
      ? { latitude: initial.latitude, longitude: initial.longitude }
      : null,
  );
  const [busy, setBusy] = useState(false);

  const useCurrent = async () => {
    setBusy(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à localização para cadastrar.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e) {
      Alert.alert('Falha ao obter localização', String(e));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    Keyboard.dismiss();
    if (!coords) {
      Alert.alert(
        'Cadastre a localização',
        'Toque em "Usar minha localização atual" estando no escritório.',
      );
      return;
    }
    const r = parseInt(radiusStr, 10);
    if (!Number.isFinite(r) || r < 30 || r > 1000) {
      Alert.alert('Raio inválido', 'Informe um raio entre 30 e 1000 metros.');
      return;
    }
    await onSave({
      id: initial.id,
      name: name.trim() || 'Escritório',
      latitude: coords.latitude,
      longitude: coords.longitude,
      radiusMeters: r,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isNew ? 'Novo escritório' : 'Editar escritório'}</Text>
        <Text style={styles.subtitle}>
          Estando no local, capture a posição e ajuste o raio de detecção.
        </Text>

        <Card>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Faria Lima, Centro, Casa do cliente..."
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
          />

          <Text style={styles.label}>Localização</Text>
          {coords ? (
            <View style={styles.coordsBox}>
              <Text style={styles.coordsLine}>Lat {coords.latitude.toFixed(5)}</Text>
              <Text style={styles.coordsLine}>Lng {coords.longitude.toFixed(5)}</Text>
            </View>
          ) : (
            <View style={[styles.coordsBox, styles.coordsBoxEmpty]}>
              <Text style={styles.coordsHint}>Nenhuma localização capturada.</Text>
            </View>
          )}
          <Button
            title={coords ? 'Atualizar com a localização atual' : 'Usar minha localização atual'}
            onPress={useCurrent}
            variant="secondary"
            loading={busy}
          />

          <Text style={styles.label}>Raio de detecção (metros)</Text>
          <TextInput
            value={radiusStr}
            onChangeText={setRadiusStr}
            keyboardType="number-pad"
            placeholder="120"
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
          />
          <Text style={styles.hint}>
            Maior = mais permissivo. 100–200 m funciona para a maioria dos escritórios.
          </Text>
        </Card>

        <View style={{ height: spacing(2) }} />
        <Button title="Salvar" onPress={save} />
        <View style={{ height: spacing(1) }} />
        <Button title="Voltar" variant="ghost" onPress={onBack} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(2), paddingBottom: spacing(8) },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 4,
    marginBottom: spacing(2),
  },
  empty: {
    color: colors.inkSoft,
    textAlign: 'center',
    paddingVertical: spacing(1),
  },
  officeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(1.5),
  },
  officeName: { fontSize: 16, fontWeight: '700', color: colors.ink },
  officeMeta: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.blueSoft,
    marginLeft: 8,
  },
  removeText: { color: colors.blue, fontWeight: '700', fontSize: 12 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing(1.5),
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  coordsBox: {
    backgroundColor: colors.blueSoft,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
  },
  coordsBoxEmpty: { backgroundColor: colors.bg },
  coordsLine: {
    color: colors.blue,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 13,
  },
  coordsHint: { color: colors.inkSoft, fontStyle: 'italic' },
  hint: { fontSize: 12, color: colors.inkSoft, marginTop: 6 },
});
